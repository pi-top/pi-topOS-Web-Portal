from pitopcommon.logger import PTLogger
from fileinput import input as finput
from os import remove, utime
from pathlib import Path

from .command_runner import run_command
from .paths import (
    use_test_path,
    etc_pi_top,
    boot_cmdline_txt,
    startup_noise_breadcrumb,
    eula_agreed_breadcrumb
)


def available_space() -> int:
    PTLogger.info("Function: available_space()")
    out = run_command("df --block-size=1 --output=avail '/'",
                      timeout=2).splitlines()

    if use_test_path():
        return "1000000000000"

    if len(out) == 2:
        space = out[1].strip()
    else:
        space = None

    if space == "":
        space = None

    PTLogger.info("Available Space: '%s'" % space)
    return space


def expand_file_system() -> None:
    PTLogger.info("Function: expand_file_system()")
    run_command("/usr/lib/pt-os-setup/expand-fs.sh",
                timeout=60, lower_priority=True)


def configure_tour() -> None:
    PTLogger.info("Function: configure_tour()")
    run_command(
        "ln -s /usr/lib/pt-tour/pt-tour.desktop /etc/xdg/autostart", timeout=60, lower_priority=True)


def update_mime_database() -> None:
    PTLogger.info("Function: update_mime_database()")
    run_command("update-mime-database /usr/share/mime",
                timeout=90, lower_priority=True)


def deprioritise_openbox_session() -> None:
    PTLogger.info("Function: deprioritise_openbox_session()")
    run_command(
        "update-alternatives --install /usr/bin/x-session-manager " +
        "x-session-manager /usr/bin/openbox-session 40",
        timeout=30, lower_priority=True)


def stop_onboarding_autostart() -> None:
    PTLogger.info("Function: stop_onboarding_autostart()")
    remove("/etc/xdg/autostart/pt-os-setup.desktop")


def enable_device_registration_service() -> None:
    PTLogger.info("Function: enable_device_registration_service()")
    run_command("systemctl enable pt-device-registration",
                timeout=30, lower_priority=True)


def enable_os_updater_service():
    PTLogger.info("Function: enable_os_updater()")

    return run_command("systemctl enable pt-os-updater",
                       timeout=30, lower_priority=True)


def enable_firmware_updater_service():
    PTLogger.info("Function: enable_firmware_updater()")

    return run_command("systemctl enable pt-firmware-updater",
                       timeout=30, lower_priority=True)


def enable_further_link_service():
    PTLogger.info("Function: enable_further_link()")

    return run_command("systemctl enable pt-further-link",
                       timeout=30, lower_priority=True)


def _touch_etc_pi_top_file(file_path) -> None:
    # create /etc/pi-top if it doesn't exist
    Path(etc_pi_top()).mkdir(exist_ok=True)

    try:
        utime(file_path, None)
    except OSError:
        open(file_path, 'a').close()


def disable_startup_noise() -> None:
    PTLogger.info("Function: disable_startup_noise()")
    _touch_etc_pi_top_file(startup_noise_breadcrumb())


def mark_eula_agreed() -> None:
    PTLogger.info("Function: mark_eula_agreed()")
    _touch_etc_pi_top_file(eula_agreed_breadcrumb())


def unhide_all_boot_messages() -> None:
    PTLogger.info("Function: unhide_all_boot_messages()")
    for line in finput(boot_cmdline_txt(), inplace=True):
        print(line.replace(" fbcon=map:2", "").rstrip())


def reboot() -> None:
    PTLogger.info("Function: reboot()")
    run_command("reboot", timeout=30, lower_priority=True)


def enable_pt_sys_oled():
    PTLogger.info("Function: enable_pt_sys_oled()")

    return run_command("systemctl enable pt-sys-oled",
                       timeout=30, lower_priority=True)


def enable_mouse_cursor():
    PTLogger.info("Function: enable_mouse_cursor()")

    return run_command('sed -i "s/xserver-command=X -nocursor/#xserver-command=X/1" /etc/lightdm/lightdm.conf',
                       timeout=30, lower_priority=True)


def restore_files():
    PTLogger.info("Function: restore_files()")

    run_command("rsync -av /usr/lib/pt-os-setup/bak/ /",
                timeout=30, lower_priority=True)
    run_command("rm -r /usr/lib/pt-os-setup/bak/",
                timeout=30, lower_priority=True)
