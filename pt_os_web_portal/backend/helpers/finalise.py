from os import path, remove

from pitop.common.command_runner import run_command, run_command_background
from pitop.common.common_names import DeviceName
from pitop.common.firmware_device import FirmwareDevice
from pitop.common.logger import PTLogger
from pitop.system import device_type
from pt_fw_updater.check import main as update_firmware

from ... import state
from .paths import use_test_path


def available_space() -> str:
    PTLogger.debug("Function: available_space()")
    out = run_command("df --block-size=1 --output=avail '/'", timeout=2).splitlines()

    if use_test_path():
        return "1000000000000"

    if len(out) == 2:
        space = out[1].strip()
    else:
        space = ""

    PTLogger.debug(f"Available Space: '{space}'")
    return space


def configure_landing() -> None:
    PTLogger.debug("Function: configure_landing()")
    try:
        run_command(
            f"ln -s {path.dirname(path.realpath(__file__))}/../../resources/pt-os-landing.desktop /etc/xdg/autostart",
            timeout=60,
            lower_priority=True,
        )
    except Exception as e:
        PTLogger.error(f"configure_tour: {e}")


def deprioritise_openbox_session() -> None:
    PTLogger.debug("Function: deprioritise_openbox_session()")
    run_command(
        "update-alternatives --install /usr/bin/x-session-manager "
        + "x-session-manager /usr/bin/openbox-session 40",
        timeout=30,
        lower_priority=True,
    )


def stop_onboarding_autostart() -> None:
    PTLogger.debug("Function: stop_onboarding_autostart()")
    try:
        remove("/etc/xdg/autostart/pt-os-setup.desktop")
        state.set("app", "onboarded", "true")
    except FileNotFoundError:
        PTLogger.debug("stop_onboarding_autostart: Onboarding already disabled")
    except Exception as e:
        PTLogger.error(f"stop_onboarding_autostart: {e}")


def enable_firmware_updater_service():
    PTLogger.debug("Function: enable_firmware_updater()")

    return run_command(
        "systemctl enable pt-firmware-updater", timeout=30, lower_priority=True
    )


def enable_further_link_service():
    PTLogger.debug("Function: enable_further_link()")

    return run_command("systemctl enable further-link", timeout=30, lower_priority=True)


def reboot() -> None:
    PTLogger.debug("Function: reboot()")
    if path.exists("/tmp/.com.pi-top.pi-topd.pt-poweroff.reboot-on-shutdown"):
        # Do shutdown, let hub start back up
        run_command_background("shutdown -h now")
    else:
        run_command_background("reboot")


def enable_pt_miniscreen():
    PTLogger.debug("Function: enable_pt_miniscreen()")

    return run_command(
        "systemctl enable pt-miniscreen", timeout=30, lower_priority=True
    )


def restore_files():
    PTLogger.debug("Function: restore_files()")

    try:
        run_command(
            "rsync -av /usr/lib/pt-os-web-portal/bak/ /",
            timeout=30,
            lower_priority=True,
        )
        run_command(
            "rm -r /usr/lib/pt-os-web-portal/bak", timeout=30, lower_priority=True
        )
    except FileNotFoundError:
        PTLogger.debug("restore_files: Files already restored")
    except Exception as e:
        PTLogger.error(f"restore_files: {e}")


def disable_landing():
    PTLogger.debug("Function: disable_landing()")
    try:
        remove("/etc/xdg/autostart/pt-os-landing.desktop")
    except FileNotFoundError:
        PTLogger.debug("Landing already disabled.")


def python_sdk_docs_url():
    PTLogger.debug("Function: python_sdk_docs_url()")
    return run_command("pi-top support links docs -p", timeout=10, check=False).strip()


def onboarding_completed():
    return state.get("app", "onboarded", fallback="false") == "true"


def update_eeprom():
    PTLogger.debug("Function: update_eeprom()")
    try:
        run_command(
            "/usr/lib/pt-os-notify-services/pt-eeprom -f", timeout=10, check=False
        )
    except Exception as e:
        PTLogger.error(f"update_eeprom: {e}")


def do_firmware_update():
    if device_type() != DeviceName.pi_top_4.value:
        return

    fw_dev_id_str = "pt4_hub"
    try:
        update_firmware(fw_dev_id_str, force=True)
    except Exception as e:
        PTLogger.warning(f"do_firmware_update: {e}")

    if not FirmwareDevice(
        FirmwareDevice.str_name_to_device_id(fw_dev_id_str)
    ).get_check_fw_okay():
        return

    run_command(
        "touch /tmp/.com.pi-top.pi-topd.pt-poweroff.reboot-on-shutdown",
        timeout=10,
    )
