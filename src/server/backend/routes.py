from threading import Thread
from . import sockets
from json import dumps as jdumps

from pitopcommon.logger import PTLogger

from flask import (
    abort,
    current_app as app,
    request,
    send_from_directory,
)

from .helpers.build import os_build_info
from .helpers.language import (
    list_locales_supported,
    current_locale,
    set_locale
)
from .helpers.wifi_country import (
    list_wifi_countries,
    current_wifi_country,
    set_wifi_country
)
from .helpers.timezone import get_all_timezones, set_timezone, get_current_timezone
from .helpers.keyboard import (
    list_keyboard_layout_codes,
    list_keyboard_layout_variants,
    current_keyboard_layout,
    set_keyboard_layout,
)
from .helpers.registration import set_registration_email
from .helpers.finalise import (
    available_space,
    close_pt_browser,
    configure_tour,
    deprioritise_openbox_session,
    disable_startup_noise,
    disable_tour,
    enable_firmware_updater_service,
    enable_further_link_service,
    enable_mouse_cursor,
    enable_os_updater_service,
    enable_pt_sys_oled,
    mark_eula_agreed,
    onboarding_completed,
    python_sdk_docs_url,
    reboot,
    restore_files,
    stop_onboarding_autostart,
    unhide_all_boot_messages,
    update_mime_database,
)
from .helpers.wifi_manager import (
    get_ssids,
    attempt_connection,
    current_wifi_ssid,
    is_connected_to_internet
)
from .helpers.os_updater import (
    os_upgrade_size,
    start_os_upgrade,
    prepare_os_upgrade
)

from .helpers.expand_fs import (
    is_file_system_expanded,
    expand_file_system,
    create_expand_fs_breadcrumb
)

from .events import (
    create_emit_os_upgrade_message,
    create_emit_os_prepare_upgrade_message,
    create_emit_os_size_message
)


def abort_on_no_data(data):
    if data is None:
        abort(404)
    return jdumps(data)


@app.route('/', methods=['GET'])
def index():
    PTLogger.debug("Route '/'")
    if onboarding_completed():
        return send_from_directory(app.static_folder + "/tour", 'index.html')
    return send_from_directory(app.static_folder + "/onboarding", 'index.html')


@app.route('/onboarding', methods=['GET'])
def onboarding_index():
    PTLogger.debug("Route '/onboarding'")
    return send_from_directory(app.static_folder + "/onboarding", 'index.html')


@app.route('/tour', methods=['GET'])
def tour_index():
    PTLogger.debug("Route '/tour'")
    return send_from_directory(app.static_folder + "/tour", 'index.html')


@app.route('/FSMePro/<filename>', methods=['GET'])
def FSMePro(filename):
    PTLogger.debug("Route '/FSMePro/%s'" % filename)
    return send_from_directory('/usr/share/fonts/opentype/FSMePro', filename)


# Startup
@app.route('/build-info', methods=['GET'])
def get_build_info():
    PTLogger.debug("Route '/build-info'")
    return abort_on_no_data(os_build_info())


# Language
@app.route('/list-locales-supported', methods=['GET'])
def get_locales_supported():
    PTLogger.debug("Route '/list-locales-supported'")
    return abort_on_no_data(list_locales_supported())


@app.route('/current-locale', methods=['GET'])
def get_current_locale():
    PTLogger.debug("Route '/current-locale'")
    return abort_on_no_data(current_locale())


@app.route('/set-locale', methods=['POST'])
def post_locale():
    PTLogger.debug("Route '/set-locale'")
    locale_code = request.get_json().get('locale_code')
    if not isinstance(locale_code, str):
        return abort(422)

    if set_locale(locale_code) is None:
        return abort(400)

    return "OK"


# Wifi Country
@app.route('/list-wifi-countries', methods=['GET'])
def get_wifi_countries():
    PTLogger.debug("Route '/list-wifi-countries'")
    return abort_on_no_data(list_wifi_countries())


@app.route('/current-wifi-country', methods=['GET'])
def get_current_wifi_country():
    PTLogger.debug("Route '/current-wifi-country'")
    return abort_on_no_data(current_wifi_country())


@app.route('/set-wifi-country', methods=['POST'])
def post_country():
    PTLogger.debug("Route '/set-wifi-country'")
    country = request.get_json().get('wifi_country')
    if not isinstance(country, str):
        return abort(422)

    if set_wifi_country(country) is None:
        return abort(400)

    return "OK"


# Timezones
@app.route('/list-timezones', methods=['GET'])
def get_timezones():
    return abort_on_no_data(get_all_timezones())


@app.route('/current-timezone', methods=['GET'])
def current_timezone():
    return abort_on_no_data(get_current_timezone())


@app.route('/set-timezone', methods=['POST'])
def post_timezone():
    timezone = request.get_json().get('timezone')

    if not isinstance(timezone, str):
        return abort(422)

    if set_timezone(timezone) is None:
        return abort(400)

    return "OK"


# Keyboard
@app.route('/list-keyboard-layout-codes', methods=['GET'])
def get_keyboard_layout_codes():
    PTLogger.debug("Route '/list-keyboard-layout-codes'")
    return abort_on_no_data(list_keyboard_layout_codes())


@app.route('/list-keyboard-layout-variants', methods=['GET'])
def get_keyboard_layout_variants():
    PTLogger.debug("Route '/list-keyboard-layout-variants'")
    return abort_on_no_data(list_keyboard_layout_variants())


@app.route('/current-keyboard-layout', methods=['GET'])
def get_current_keyboard_layout():
    PTLogger.debug("Route '/current-keyboard-layout'")
    layout, variant = current_keyboard_layout()
    if layout is None:
        abort(404)
    return jdumps({'layout': layout, 'variant': variant})


@app.route('/set-keyboard-layout', methods=['POST'])
def post_keyboard_layout():
    PTLogger.debug("Route '/set-keyboard-layout'")
    layout = request.get_json().get('layout')
    if not isinstance(layout, str):
        return abort(422)

    variant = request.get_json().get('variant')

    set_keyboard_layout(layout, variant)
    return "OK"


# Wifi connection
@app.route('/wifi-ssids', methods=['GET'])
def get_wifi_ssids():
    PTLogger.debug("Route '/wifi-ssids'")

    return abort_on_no_data(get_ssids())


@app.route('/wifi-credentials', methods=['POST'])
def post_wifi_credentials():
    PTLogger.debug("Route '/wifi-credentials'")
    ssid = request.get_json().get('ssid')
    password = request.get_json().get('password')
    if not isinstance(ssid, str) or not isinstance(password, str):
        return abort(422)

    try:
        attempt_connection(ssid, password)
    except Exception:
        return abort(401)

    return "OK"


@app.route('/is-connected', methods=['GET'])
def get_is_connected():
    PTLogger.debug("Route '/is-connected'")
    is_connected = is_connected_to_internet()
    return jdumps({'connected': is_connected})


@app.route('/current-wifi-ssid', methods=['GET'])
def get_is_connected_to_ssid():
    PTLogger.debug("Route '/current-wifi-ssid'")
    return abort_on_no_data(current_wifi_ssid())


# OS Upgrade
@sockets.route('/os-upgrade')
def os_upgrade(ws):
    thread_arr = list()

    while not ws.closed:
        message = ws.receive()
        if message == "prepare":
            t = Thread(target=prepare_os_upgrade, args=(
                create_emit_os_prepare_upgrade_message(ws),), daemon=True)
            t.start()
            thread_arr.append(t)
        elif message == "start":
            t = Thread(target=start_os_upgrade, args=(
                create_emit_os_upgrade_message(ws),), daemon=True)
            t.start()
            thread_arr.append(t)
        elif message == "size":
            os_upgrade_size(create_emit_os_size_message(ws))

    for t in thread_arr:
        if t.is_alive():
            t.join()


# Register
@app.route('/set-registration', methods=['POST'])
def post_registration():
    PTLogger.debug("Route '/set-registration'")
    email = request.get_json().get('email')
    if not isinstance(email, str):
        return abort(422)

    set_registration_email(email)
    return "OK"


# Finalise
@app.route('/available-space', methods=['GET'])
def get_available_space():
    PTLogger.debug("Route '/available-space'")
    return abort_on_no_data(available_space())


@app.route('/expand-fs', methods=['POST'])
def post_expand_fs():
    PTLogger.debug("Route '/expand-fs'")
    expand_file_system()
    create_expand_fs_breadcrumb()
    return "OK"


@app.route('/configure-tour', methods=['POST'])
def post_configure_tour():
    PTLogger.debug("Route '/configure-tour'")
    configure_tour()
    return "OK"


@app.route('/update-mime-database', methods=['POST'])
def post_update_mime_database():
    PTLogger.debug("Route '/update-mime-database'")
    update_mime_database()
    return "OK"


@app.route('/deprioritise-openbox-session', methods=['POST'])
def post_deprioritise_openbox_session():
    PTLogger.debug("Route '/deprioritise-openbox-session'")
    deprioritise_openbox_session()
    return "OK"


@app.route('/stop-onboarding-autostart', methods=['POST'])
def post_stop_onboarding_autostart():
    PTLogger.debug("Route '/stop-onboarding-autostart'")
    stop_onboarding_autostart()
    return "OK"


@app.route('/enable-os-updater-service', methods=['POST'])
def post_enable_os_updater_service():
    PTLogger.debug("Route '/enable-os-updater-service'")
    enable_os_updater_service()
    return "OK"


@app.route('/enable-firmware-updater-service', methods=['POST'])
def post_enable_firmware_updater_service():
    PTLogger.debug("Route '/enable-firmware-updater-service'")
    enable_firmware_updater_service()
    return "OK"


@app.route('/enable-further-link-service', methods=['POST'])
def post_enable_further_link_service():
    PTLogger.debug("Route '/enable-further-link-service'")
    enable_further_link_service()
    return "OK"


@app.route('/disable-startup-noise', methods=['POST'])
def post_disable_startup_noise():
    PTLogger.debug("Route '/disable-startup-noise'")
    disable_startup_noise()
    return "OK"


@app.route('/mark-eula-agreed', methods=['POST'])
def post_mark_eula_agreed():
    PTLogger.debug("Route '/mark-eula-agreed'")
    mark_eula_agreed()
    return "OK"


@app.route('/unhide-all-boot-messages', methods=['POST'])
def post_unhide_all_boot_messages():
    PTLogger.debug("Route '/unhide-all-boot-messages'")
    unhide_all_boot_messages()
    return "OK"


@app.route('/reboot', methods=['POST'])
def post_reboot():
    PTLogger.debug("Route '/reboot'")
    reboot()
    return "OK"  # no response here is also OK!


@app.route('/enable-pt-sys-oled', methods=['POST'])
def post_enable_pt_sys_oled():
    PTLogger.debug("Route '/enable-pt-sys-oled'")
    enable_pt_sys_oled()
    return "OK"


@app.route('/enable-mouse-cursor', methods=['POST'])
def post_enable_mouse_cursor():
    PTLogger.debug("Route '/enable-mouse-cursor'")
    enable_mouse_cursor()
    return "OK"


@app.route('/restore-files', methods=['POST'])
def post_restore_files():
    PTLogger.debug("Route '/restore-files'")
    restore_files()
    return "OK"


@app.route('/is-fs-expanded', methods=['GET'])
def get_is_fs_expanded():
    PTLogger.debug("Route '/is-fs-expanded'")
    return jdumps({'expanded': is_file_system_expanded()})


@app.route('/python-sdk-docs-url', methods=['GET'])
def get_python_sdk_docs_url():
    PTLogger.debug("Route '/python-sdk-docs-url")
    return jdumps({'url': python_sdk_docs_url()})


@app.route('/disable-tour', methods=['POST'])
def post_disable_tour():
    PTLogger.debug("Route '/disable-tour'")
    disable_tour()
    return "OK"


@app.route('/close-pt-browser', methods=['POST'])
def post_close_pt_browser():
    PTLogger.debug("Route '/close-pt-browser'")
    close_pt_browser()
    return "OK"
