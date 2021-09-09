from enum import Enum
from json import dumps as jdumps
from os import path
from threading import Thread

from flask import abort
from flask import current_app as app
from flask import redirect, request, send_from_directory
from pitop.common.logger import PTLogger
from pitop.common.sys_info import is_connected_to_internet

from . import sockets
from .helpers.about import device_data
from .helpers.build import os_build_info
from .helpers.extras import leave_started_onboarding_breadcrumb
from .helpers.finalise import (
    available_space,
    configure_tour,
    deprioritise_openbox_session,
    enable_firmware_updater_service,
    enable_further_link_service,
    enable_pt_miniscreen,
    reboot,
    restore_files,
    stop_onboarding_autostart,
    update_eeprom,
)
from .helpers.keyboard import (
    current_keyboard_layout,
    list_keyboard_layout_codes,
    list_keyboard_layout_variants,
    set_keyboard_layout,
)
from .helpers.language import current_locale, list_locales_supported, set_locale
from .helpers.os_update_manager import (
    check_relevant_os_updates,  # TODO: move into separate file
)
from .helpers.registration import set_registration_email
from .helpers.system import enable_ap_mode, restart_web_portal_service
from .helpers.timezone import get_all_timezones, get_current_timezone, set_timezone
from .helpers.tour import (
    close_pt_browser,
    disable_tour,
    further_url,
    onboarding_completed,
    open_forum,
    open_further,
    open_knowledge_base,
    open_python_sdk_docs,
    python_sdk_docs_url,
)
from .helpers.wifi_country import (
    current_wifi_country,
    list_wifi_countries,
    set_wifi_country,
)
from .helpers.wifi_manager import attempt_connection, current_wifi_ssid, get_ssids


def get_os_updater():
    return app.config["OS_UPDATER"]


class FrontendAppRoutes(Enum):
    TOUR = "/tour"
    ONBOARDING = "/onboarding"
    ABOUT = "/about"
    UPDATER = "/updater"

    @classmethod
    def is_valid(cls, route):
        try:
            path = route
            path_delimiter = route.find("/", 1)
            if path_delimiter > 0:
                path = route[:path_delimiter]
            cls(str(path))
        except ValueError:
            return False
        return True


def abort_on_no_data(data):
    if data is None or (isinstance(data, str) and len(data) == 0):
        abort(400)
    return jdumps(data)


@app.route("/", methods=["GET"])
def index():
    PTLogger.debug("Route '/'")
    if not onboarding_completed():
        PTLogger.info("Onboarding not completed yet. Redirecting...")
        return redirect(FrontendAppRoutes.ONBOARDING.value)
    return redirect(FrontendAppRoutes.TOUR.value)


@app.errorhandler(404)
def not_found(e):
    if not FrontendAppRoutes.is_valid(request.path) or (
        FrontendAppRoutes.ONBOARDING.value not in request.path
        and not onboarding_completed()
    ):
        return redirect("/")
    return app.send_static_file("index.html")


# Startup
@app.route("/build-info", methods=["GET"])
def get_build_info():
    PTLogger.debug("Route '/build-info'")
    return abort_on_no_data(os_build_info())


# Language
@app.route("/list-locales-supported", methods=["GET"])
def get_locales_supported():
    PTLogger.debug("Route '/list-locales-supported'")
    return abort_on_no_data(list_locales_supported())


@app.route("/current-locale", methods=["GET"])
def get_current_locale():
    PTLogger.debug("Route '/current-locale'")
    return abort_on_no_data(current_locale())


@app.route("/set-locale", methods=["POST"])
def post_locale():
    PTLogger.debug("Route '/set-locale'")
    locale_code = request.get_json().get("locale_code")
    if not isinstance(locale_code, str):
        return abort(422)

    if set_locale(locale_code) is None:
        return abort(400)

    return "OK"


# Wifi Country
@app.route("/list-wifi-countries", methods=["GET"])
def get_wifi_countries():
    PTLogger.debug("Route '/list-wifi-countries'")
    return abort_on_no_data(list_wifi_countries())


@app.route("/current-wifi-country", methods=["GET"])
def get_current_wifi_country():
    PTLogger.debug("Route '/current-wifi-country'")
    return abort_on_no_data(current_wifi_country())


@app.route("/set-wifi-country", methods=["POST"])
def post_country():
    PTLogger.debug("Route '/set-wifi-country'")
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
    PTLogger.debug("Route '/list-keyboard-layout-codes'")
    return abort_on_no_data(list_keyboard_layout_codes())


@app.route("/list-keyboard-layout-variants", methods=["GET"])
def get_keyboard_layout_variants():
    PTLogger.debug("Route '/list-keyboard-layout-variants'")
    return abort_on_no_data(list_keyboard_layout_variants())


@app.route("/current-keyboard-layout", methods=["GET"])
def get_current_keyboard_layout():
    PTLogger.debug("Route '/current-keyboard-layout'")
    layout, variant = current_keyboard_layout()
    if layout is None:
        abort(404)
    return jdumps({"layout": layout, "variant": variant})


@app.route("/set-keyboard-layout", methods=["POST"])
def post_keyboard_layout():
    PTLogger.debug("Route '/set-keyboard-layout'")
    layout = request.get_json().get("layout")
    if not isinstance(layout, str):
        return abort(422)

    variant = request.get_json().get("variant")

    set_keyboard_layout(layout, variant)
    return "OK"


# Wifi connection
@app.route("/wifi-ssids", methods=["GET"])
def get_wifi_ssids():
    PTLogger.debug("Route '/wifi-ssids'")

    return abort_on_no_data(get_ssids())


@app.route("/wifi-credentials", methods=["POST"])
def post_wifi_credentials():
    PTLogger.debug("Route '/wifi-credentials'")
    ssid = request.get_json().get("ssid")
    password = request.get_json().get("password")
    if not isinstance(ssid, str) or not isinstance(password, str):
        return abort(422)

    try:
        attempt_connection(ssid, password)
    except Exception:
        return abort(401)

    return "OK"


@app.route("/is-connected", methods=["GET"])
def get_is_connected():
    PTLogger.debug("Route '/is-connected'")
    is_connected = is_connected_to_internet()
    return jdumps({"connected": is_connected})


@app.route("/current-wifi-ssid", methods=["GET"])
def get_is_connected_to_ssid():
    PTLogger.debug("Route '/current-wifi-ssid'")
    return abort_on_no_data(current_wifi_ssid())


# OS Upgrade
@sockets.route("/os-upgrade")
def os_upgrade(ws):
    thread_arr = list()

    while not ws.closed:
        message = ws.receive()

        funcs = {
            "prepare": get_os_updater().prepare_os_upgrade,
            "start": get_os_updater().start_os_upgrade,
            "size": get_os_updater().os_upgrade_size,
        }

        if not funcs.get(message):
            PTLogger.warning(
                f"Invalid message from websocket '{message}' - doing nothing"
            )
            return

        t = Thread(
            target=funcs.get(message),
            args=(ws,),
            daemon=True,
        )
        t.start()
        thread_arr.append(t)

    for t in thread_arr:
        if t.is_alive():
            t.join()


# Register
@app.route("/set-registration", methods=["POST"])
def post_registration():
    PTLogger.debug("Route '/set-registration'")
    email = request.get_json().get("email")
    if not isinstance(email, str):
        return abort(422)

    set_registration_email(email)
    return "OK"


# Finalise
@app.route("/available-space", methods=["GET"])
def get_available_space():
    PTLogger.debug("Route '/available-space'")
    return abort_on_no_data(available_space())


@app.route("/configure-tour", methods=["POST"])
def post_configure_tour():
    PTLogger.debug("Route '/configure-tour'")
    configure_tour()
    return "OK"


@app.route("/deprioritise-openbox-session", methods=["POST"])
def post_deprioritise_openbox_session():
    PTLogger.debug("Route '/deprioritise-openbox-session'")
    deprioritise_openbox_session()
    return "OK"


@app.route("/stop-onboarding-autostart", methods=["POST"])
def post_stop_onboarding_autostart():
    PTLogger.debug("Route '/stop-onboarding-autostart'")
    stop_onboarding_autostart()
    return "OK"


@app.route("/enable-firmware-updater-service", methods=["POST"])
def post_enable_firmware_updater_service():
    PTLogger.debug("Route '/enable-firmware-updater-service'")
    enable_firmware_updater_service()
    return "OK"


@app.route("/enable-further-link-service", methods=["POST"])
def post_enable_further_link_service():
    PTLogger.debug("Route '/enable-further-link-service'")
    enable_further_link_service()
    return "OK"


@app.route("/reboot", methods=["POST"])
def post_reboot():
    PTLogger.debug("Route '/reboot'")
    reboot()
    return "OK"  # no response here is also OK!


@app.route("/enable-pt-miniscreen", methods=["POST"])
def post_enable_pt_miniscreen():
    PTLogger.debug("Route '/enable-pt-miniscreen'")
    enable_pt_miniscreen()
    return "OK"


@app.route("/restore-files", methods=["POST"])
def post_restore_files():
    PTLogger.debug("Route '/restore-files'")
    restore_files()
    return "OK"


@app.route("/python-sdk-docs-url", methods=["GET"])
def get_python_sdk_docs_url():
    PTLogger.debug("Route '/python-sdk-docs-url")
    return jdumps({"url": python_sdk_docs_url()})


@app.route("/disable-tour", methods=["POST"])
def post_disable_tour():
    PTLogger.debug("Route '/disable-tour'")
    disable_tour()
    return "OK"


@app.route("/close-pt-browser", methods=["POST"])
def post_close_pt_browser():
    PTLogger.debug("Route '/close-pt-browser'")
    close_pt_browser()
    return "OK"


@app.route("/open-further", methods=["POST"])
def post_open_further():
    PTLogger.debug("Route '/open-further'")
    open_further()
    return "OK"


@app.route("/further-url", methods=["GET"])
def get_further_url():
    PTLogger.debug("Route '/further-url'")
    return jdumps({"url": further_url()})


@app.route("/open-python-sdk-docs", methods=["POST"])
def post_open_python_sdk_docs():
    PTLogger.debug("Route '/open-python-sdk-docs'")
    open_python_sdk_docs()
    return "OK"


@app.route("/open-knowledge-base", methods=["POST"])
def post_open_knowledge_base():
    PTLogger.debug("Route '/open-knowledge-base'")
    open_knowledge_base()
    return "OK"


@app.route("/open-forum", methods=["POST"])
def post_open_forum():
    PTLogger.debug("Route '/open-forum'")
    open_forum()
    return "OK"


@app.route("/about-device", methods=["GET"])
def get_about_device():
    PTLogger.debug("Route '/about-device'")
    return jdumps(device_data())


@app.route("/status", methods=["GET"])
def get_status():
    PTLogger.debug("Route '/status'")
    return "OK"


@app.route("/update-eeprom", methods=["POST"])
def post_update_eeprom():
    PTLogger.debug("Route '/update-eeprom'")
    update_eeprom()
    return "OK"


@app.route("/restart-web-portal-service", methods=["POST"])
def post_restart_web_portal_service():
    PTLogger.debug("Route '/restart-web-portal-service'")
    restart_web_portal_service()
    return "OK"


@app.route("/enable-ap-mode", methods=["POST"])
def post_enable_ap_mode():
    PTLogger.debug("Route '/enable-ap-mode'")
    enable_ap_mode()
    return "OK"


@app.route("/FSMePro/<filename>", methods=["GET"])
def FSMePro(filename):
    PTLogger.debug(f"Route '/FSMePro/{filename}'")
    current_dir = path.dirname(path.realpath(__file__))
    return send_from_directory(str(current_dir) + "/../resources/fonts", filename)


@app.route("/os-updates", methods=["GET"])
def get_os_check_update():
    PTLogger.debug("Route '/os-updates'")
    return jdumps(check_relevant_os_updates())


@app.route("/onboarding-miniscreen-app-breadcrumb", methods=["POST"])
def post_onboarding_miniscreen_app_breadcrumb():
    PTLogger.debug("Route '/onboarding-miniscreen-app-breadcrumb'")
    leave_started_onboarding_breadcrumb()
    return "OK"
