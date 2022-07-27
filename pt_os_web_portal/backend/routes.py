import logging
from ipaddress import ip_address
from json import dumps as jdumps
from threading import Thread
from urllib.request import Request, urlopen

from flask import abort
from flask import current_app as app
from flask import redirect, request, send_from_directory
from further_link.start_further import get_further_url
from pitop.common.formatting import is_url
from pitop.common.sys_info import InterfaceNetworkData, is_connected_to_internet
from pt_web_vnc.vnc import clients as vnc_clients
from pt_web_vnc.vnc import connection_details as vnc_connection_details

from ..app_window import LandingAppWindow
from ..event import AppEvents, post_event
from ..pt_os_version_check import check_relevant_pi_top_os_version_updates
from . import sockets
from .helpers.about import about_device
from .helpers.build import os_build_info
from .helpers.finalise import (
    available_space,
    configure_landing,
    deprioritise_openbox_session,
    disable_ap_mode,
    do_firmware_update,
    enable_firmware_updater_service,
    enable_further_link_service,
    enable_pt_miniscreen,
    fw_update_is_due,
    onboarding_completed,
    reboot,
    restore_files,
    should_switch_network,
    stop_onboarding_autostart,
    update_eeprom,
)
from .helpers.keyboard import (
    current_keyboard_layout,
    list_keyboard_layout_codes,
    list_keyboard_layout_variants,
    set_keyboard_layout,
)
from .helpers.landing import (
    disable_landing,
    open_forum,
    open_further,
    open_knowledge_base,
    open_os_download,
    open_python_sdk_docs,
    open_updater,
    open_wifi,
    python_sdk_docs_url,
)
from .helpers.language import current_locale, list_locales_supported, set_locale
from .helpers.registration import set_registration_email
from .helpers.system import (
    SystemService,
    service_is_active,
    service_restart,
    service_start,
    service_stop,
)
from .helpers.timezone import get_all_timezones, get_current_timezone, set_timezone
from .helpers.vnc import PtWebVncDisplayId
from .helpers.wifi_country import (
    current_wifi_country,
    list_wifi_countries,
    set_wifi_country,
)
from .helpers.wifi_manager import attempt_connection, current_wifi_bssid, get_ssids

logger = logging.getLogger(__name__)


def get_os_updater():
    return app.config["OS_UPDATER"]


def abort_on_no_data(data):
    if data is None or (isinstance(data, str) and len(data) == 0):
        abort(400)
    return jdumps(data)


@app.route("/favicon.ico")
def favicon():
    return "", 200


@app.route("/", methods=["GET"])
def index():
    logger.debug("Route '/'")
    if not onboarding_completed():
        logger.info("Onboarding not completed yet. Redirecting...")
        return redirect("/onboarding")

    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


@app.route("/Roboto/<filename>", methods=["GET"])
def roboto(filename):
    logger.debug(f"Route '/Roboto/{filename}'")
    return send_from_directory(
        "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/", filename
    )


# Startup
@app.route("/build-info", methods=["GET"])
def get_build_info():
    logger.debug("Route '/build-info'")
    return abort_on_no_data(os_build_info())


# Language
@app.route("/list-locales-supported", methods=["GET"])
def get_locales_supported():
    logger.debug("Route '/list-locales-supported'")
    return abort_on_no_data(list_locales_supported())


@app.route("/current-locale", methods=["GET"])
def get_current_locale():
    logger.debug("Route '/current-locale'")
    return abort_on_no_data(current_locale())


@app.route("/set-locale", methods=["POST"])
def post_locale():
    logger.debug("Route '/set-locale'")
    locale_code = request.get_json().get("locale_code")
    if not isinstance(locale_code, str):
        return abort(422)

    if set_locale(locale_code) is None:
        return abort(400)

    return "OK"


# Wifi Country
@app.route("/list-wifi-countries", methods=["GET"])
def get_wifi_countries():
    logger.debug("Route '/list-wifi-countries'")
    return abort_on_no_data(list_wifi_countries())


@app.route("/current-wifi-country", methods=["GET"])
def get_current_wifi_country():
    logger.debug("Route '/current-wifi-country'")
    return abort_on_no_data(current_wifi_country())


@app.route("/set-wifi-country", methods=["POST"])
def post_country():
    logger.debug("Route '/set-wifi-country'")
    country = request.get_json().get("wifi_country")
    if not isinstance(country, str):
        return abort(422)

    if set_wifi_country(country) is None:
        return abort(400)

    return "OK"


# Timezones
@app.route("/list-timezones", methods=["GET"])
def get_timezones():
    return abort_on_no_data(get_all_timezones())


@app.route("/current-timezone", methods=["GET"])
def current_timezone():
    return abort_on_no_data(get_current_timezone())


@app.route("/set-timezone", methods=["POST"])
def post_timezone():
    timezone = request.get_json().get("timezone")

    if not isinstance(timezone, str):
        return abort(422)

    if set_timezone(timezone) is None:
        return abort(400)

    return "OK"


# Keyboard
@app.route("/list-keyboard-layout-codes", methods=["GET"])
def get_keyboard_layout_codes():
    logger.debug("Route '/list-keyboard-layout-codes'")
    return abort_on_no_data(list_keyboard_layout_codes())


@app.route("/list-keyboard-layout-variants", methods=["GET"])
def get_keyboard_layout_variants():
    logger.debug("Route '/list-keyboard-layout-variants'")
    return abort_on_no_data(list_keyboard_layout_variants())


@app.route("/current-keyboard-layout", methods=["GET"])
def get_current_keyboard_layout():
    logger.debug("Route '/current-keyboard-layout'")
    layout, variant = current_keyboard_layout()
    if layout is None:
        abort(404)
    return jdumps({"layout": layout, "variant": variant})


@app.route("/set-keyboard-layout", methods=["POST"])
def post_keyboard_layout():
    logger.debug("Route '/set-keyboard-layout'")
    layout = request.get_json().get("layout")
    if not isinstance(layout, str):
        return abort(422)

    variant = request.get_json().get("variant")

    set_keyboard_layout(layout, variant)
    return "OK"


# Wifi connection
@app.route("/wifi-ssids", methods=["GET"])
def get_wifi_ssids():
    logger.debug("Route '/wifi-ssids'")

    return abort_on_no_data(get_ssids())


@app.route("/wifi-credentials", methods=["POST"])
def post_wifi_credentials():
    logger.debug("Route '/wifi-credentials'")
    bssid = request.get_json().get("bssid")
    password = request.get_json().get("password")
    if not isinstance(bssid, str) or not isinstance(password, str):
        return abort(422)

    try:
        attempt_connection(bssid, password)
    except Exception as e:
        logger.error(f"Error: {e}")
        return abort(401)

    return "OK"


@app.route("/is-connected", methods=["GET"])
def get_is_connected():
    logger.debug("Route '/is-connected'")
    is_connected = is_connected_to_internet()
    return jdumps({"connected": is_connected})


@app.route("/current-wifi-bssid", methods=["GET"])
def get_is_connected_to_bssid():
    logger.debug("Route '/current-wifi-bssid'")
    return jdumps(current_wifi_bssid())


@app.route("/is-connected-through-ap", methods=["GET"])
def get_is_connected_through_ap():
    logger.debug("Route '/is-connected-through-ap'")

    client_ip = ip_address(request.remote_addr)
    if client_ip.ipv4_mapped:
        client_ip = client_ip.ipv4_mapped
    clientUsesAp = client_ip in InterfaceNetworkData("wlan_ap0").network
    logger.info(f"Client is{'' if clientUsesAp else 'not'} connected through AP")
    return jdumps({"isUsingAp": clientUsesAp})


# OS Upgrade
@sockets.route("/os-upgrade")
def os_upgrade(ws):
    thread_arr = list()

    event_lookup = {
        "update_sources": get_os_updater().update_sources,
        "prepare": get_os_updater().stage_packages,
        "prepare_web_portal": get_os_updater().stage_web_portal,
        "start": get_os_updater().start_os_upgrade,
        "size": get_os_updater().upgrade_size,
        "legacy-updater-backend": get_os_updater().use_legacy_backend,
        "default-updater-backend": get_os_updater().use_default_backend,
        "state": get_os_updater().state,
    }

    while not ws.closed:
        message = ws.receive()
        if not message:
            continue

        if not event_lookup.get(message):
            logger.warning(
                f"/os_upgrade - Invalid message from websocket '{message}' - doing nothing"
            )
            continue
        logger.info(f"/os_upgrade - received message: '{message}'")

        t = Thread(
            target=event_lookup.get(message),
            args=(ws,),
            daemon=True,
        )
        t.start()
        thread_arr.append(t)

    # for t in thread_arr:
    #     if t.is_alive():
    #         t.join()


# Register
@app.route("/set-registration", methods=["POST"])
def post_registration():
    logger.debug("Route '/set-registration'")
    email = request.get_json().get("email")
    if not isinstance(email, str):
        return abort(422)

    set_registration_email(email)
    return "OK"


# Finalise
@app.route("/available-space", methods=["GET"])
def get_available_space():
    logger.debug("Route '/available-space'")
    return abort_on_no_data(available_space())


@app.route("/configure-landing", methods=["POST"])
def post_configure_landing():
    logger.debug("Route '/configure-landing'")
    configure_landing()
    return "OK"


@app.route("/deprioritise-openbox-session", methods=["POST"])
def post_deprioritise_openbox_session():
    logger.debug("Route '/deprioritise-openbox-session'")
    deprioritise_openbox_session()
    return "OK"


@app.route("/stop-onboarding-autostart", methods=["POST"])
def post_stop_onboarding_autostart():
    logger.debug("Route '/stop-onboarding-autostart'")
    stop_onboarding_autostart()
    return "OK"


@app.route("/enable-firmware-updater-service", methods=["POST"])
def post_enable_firmware_updater_service():
    logger.debug("Route '/enable-firmware-updater-service'")
    enable_firmware_updater_service()
    return "OK"


@app.route("/enable-further-link-service", methods=["POST"])
def post_enable_further_link_service():
    logger.debug("Route '/enable-further-link-service'")
    enable_further_link_service()
    return "OK"


@app.route("/reboot", methods=["POST"])
def post_reboot():
    logger.debug("Route '/reboot'")
    reboot()
    return "OK"  # no response here is also OK!


@app.route("/enable-pt-miniscreen", methods=["POST"])
def post_enable_pt_miniscreen():
    logger.debug("Route '/enable-pt-miniscreen'")
    enable_pt_miniscreen()
    return "OK"


@app.route("/restore-files", methods=["POST"])
def post_restore_files():
    logger.debug("Route '/restore-files'")
    restore_files()
    return "OK"


@app.route("/update-hub-firmware", methods=["POST"])
def post_update_hub_firmware():
    logger.debug("Route '/update-hub-firmware'")
    do_firmware_update()
    return "OK"


@app.route("/hub-firmware-update-is-due", methods=["GET"])
def get_hub_firmware_is_due():
    logger.debug("Route '/hub-firmware-update-is-due'")
    return jdumps(fw_update_is_due())


@app.route("/python-sdk-docs-url", methods=["GET"])
def get_python_sdk_docs_url():
    logger.debug("Route '/python-sdk-docs-url")
    return jdumps({"url": python_sdk_docs_url()})


@app.route("/disable-landing", methods=["POST"])
def post_disable_landing():
    logger.debug("Route '/disable-landing'")
    disable_landing()
    return "OK"


@app.route("/close-pt-os-landing-window", methods=["POST"])
def post_close_pt_os_landing_window():
    logger.debug("Route '/close-pt-os-landing-window'")
    LandingAppWindow().close()
    return "OK"


@app.route("/open-further", methods=["POST"])
def post_open_further():
    logger.debug("Route '/open-further'")
    open_further()
    return "OK"


@app.route("/open-updater", methods=["POST"])
def post_open_updater():
    logger.debug("Route '/open-updater'")
    open_updater()
    return "OK"


@app.route("/open-wifi", methods=["POST"])
def post_open_wifi():
    logger.debug("Route '/open-wifi'")
    open_wifi()
    return "OK"


@app.route("/open-os-download", methods=["POST"])
def post_open_os_download():
    logger.debug("Route '/open-os-download'")
    open_os_download()
    return "OK"


@app.route("/further-url", methods=["GET"])
def further_url():
    logger.debug("Route '/further-url'")
    return jdumps({"url": get_further_url()})


@app.route("/open-python-sdk-docs", methods=["POST"])
def post_open_python_sdk_docs():
    logger.debug("Route '/open-python-sdk-docs'")
    open_python_sdk_docs()
    return "OK"


@app.route("/open-knowledge-base", methods=["POST"])
def post_open_knowledge_base():
    logger.debug("Route '/open-knowledge-base'")
    open_knowledge_base()
    return "OK"


@app.route("/open-forum", methods=["POST"])
def post_open_forum():
    logger.debug("Route '/open-forum'")
    open_forum()
    return "OK"


@app.route("/about-device", methods=["GET"])
def get_about_device():
    logger.debug("Route '/about-device'")
    return jdumps(about_device())


@app.route("/status", methods=["GET"])
def get_status():
    logger.debug("Route '/status'")
    return "OK"


@app.route("/update-eeprom", methods=["POST"])
def post_update_eeprom():
    logger.debug("Route '/update-eeprom'")
    update_eeprom()
    return "OK"


@app.route("/restart-web-portal-service", methods=["POST"])
def post_restart_web_portal_service():
    logger.debug("Route '/restart-web-portal-service'")
    post_event(AppEvents.RESTARTING_WEB_PORTAL, True)
    service_restart(SystemService.WebPortal)
    return "OK"


@app.route("/rover-controller-start", methods=["POST"])
def post_start_rover_controller_service():
    logger.debug("Route '/rover-controller-start'")
    service_start(SystemService.RoverController)
    return "OK"


@app.route("/rover-controller-status", methods=["GET"])
def get_rover_controller_status():
    logger.debug("Route '/rover-controller-status'")

    status = service_is_active(SystemService.RoverController, timeout=1)
    if status == "active":
        try:
            response = urlopen(Request("http://localhost:8070"))
            if response.getcode() != 200:
                status = "inactive"

        except Exception:
            status = "inactive"

    return jdumps({"status": status})


@app.route("/rover-controller-stop", methods=["POST"])
def post_rover_controller_stop():
    logger.debug("Route '/rover-controller-stop'")
    service_stop(SystemService.RoverController)
    return "OK"


@app.route("/os-updates", methods=["GET"])
def get_os_check_update():
    logger.debug("Route '/os-updates'")
    return jdumps(check_relevant_pi_top_os_version_updates())


@app.route("/onboarding-miniscreen-ready-to-be-a-maker", methods=["POST"])
def post_onboarding_ready_to_be_a_maker():
    logger.debug("Route '/onboarding-miniscreen-ready-to-be-a-maker'")
    post_event(AppEvents.READY_TO_BE_A_MAKER, True)
    return "OK"


@app.route("/disable-ap-mode", methods=["POST"])
def post_disable_ap_mode():
    logger.debug("Route '/disable-ap-mode'")
    disable_ap_mode()
    return "OK"


@app.route("/should-switch-networks", methods=["GET"])
def get_client_should_switch_network():
    logger.debug("Route '/should-switch-networks'")
    return jdumps(should_switch_network(request))


@app.route("/start-vnc-wpa-gui", methods=["POST"])
def post_start_vnc_wpa_gui():
    logger.debug("Route '/start-vnc-wpa-gui'")
    status = service_is_active(SystemService.VncWpaGui, timeout=5)
    if status != "active":
        service_restart(SystemService.VncWpaGui)
    return "OK"


@app.route("/stop-vnc-wpa-gui", methods=["POST"])
def post_stop_vnc_wpa_gui():
    logger.debug("Route '/stop-vnc-wpa-gui'")

    clients = vnc_clients(PtWebVncDisplayId.WpaGui.value)
    should_stop_service = clients == 0

    logger.info(
        f"{'' if should_stop_service else 'Not'} stopping {SystemService.VncWpaGui.value} service, it has {clients} connected clients."
    )
    if should_stop_service:
        service_stop(SystemService.VncWpaGui)
    return "OK"


@app.route("/vnc-wpa-gui-url", methods=["GET"])
def get_vnc_wpa_gui_url():
    logger.debug("Route '/vnc-wpa-gui-url'")
    url = ""
    try:
        details = vnc_connection_details(PtWebVncDisplayId.WpaGui.value)
        if is_url(details.url):
            url = f"{details.scheme}://{request.host}:{details.port}{details.path}"
    except Exception:
        pass
    return jdumps({"url": url})


@app.route("/vnc-desktop-url", methods=["GET"])
def get_vnc_desktop_url():
    logger.debug("Route '/vnc-desktop-url'")
    url = ""
    try:
        details = vnc_connection_details(PtWebVncDisplayId.Desktop.value)
        if is_url(details.url):
            host_url = request.host.split(":")[0]
            url = f"{details.scheme}://{host_url}:{details.port}{details.path}"
    except Exception:
        pass
    return jdumps({"url": url})


@app.route("/vnc-service-state", methods=["GET"])
def get_vnc_service_state():
    logger.debug("Route '/vnc-service-state'")

    return jdumps(
        {
            "isRunning": all(
                [
                    service_is_active(SystemService.Vnc) == "active",
                    service_is_active(SystemService.VncDesktop) == "active",
                ]
            )
        }
    )
