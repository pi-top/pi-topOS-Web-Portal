from os import environ, path
from sys import platform


def use_test_path():
    return environ.get("TESTING", "") == "1" or platform == "darwin"


def get_test_file_path(filename):
    dirname = path.dirname(__file__)
    return path.join(dirname, "../../../tests/mocked_system_folder/", filename)


def supported_locales():
    if use_test_path():
        return get_test_file_path("SUPPORTED")

    return "/usr/share/i18n/SUPPORTED"


def zone_tab():
    if use_test_path():
        return get_test_file_path("zone.tab")

    return "/usr/share/zoneinfo/zone.tab"


def default_locale():
    if use_test_path():
        return get_test_file_path("locale")

    return "/etc/default/locale"


def locales_gen():
    if use_test_path():
        return get_test_file_path("locale.gen")

    return "/etc/locale.gen"


def iso_countries():
    if use_test_path():
        return get_test_file_path("iso3166.tab")

    return "/usr/share/zoneinfo/iso3166.tab"


def default_keyboard_conf():
    if use_test_path():
        return get_test_file_path("keyboard")

    return "/etc/default/keyboard"


def boot_cmdline_txt():
    if use_test_path():
        return get_test_file_path("cmdline.txt")

    return "/boot/cmdline.txt"


def etc_pi_top():
    if use_test_path():
        return get_test_file_path("")
    return "/etc/pi-top"


def pt_issue():
    if use_test_path():
        return get_test_file_path("pt-issue")
    return "/etc/pt-issue"
