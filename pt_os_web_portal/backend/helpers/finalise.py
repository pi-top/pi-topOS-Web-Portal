import logging
from os import path, remove

from pitop.common.bitwise_ops import set_bits_high, set_bits_low
from pitop.common.command_runner import run_command, run_command_background
from pitop.common.common_names import DeviceName
from pitop.common.firmware_device import FirmwareDevice
from pitop.common.i2c_device import I2CDevice
from pitop.system import device_type
from pt_fw_updater.update import main as update_firmware

from ... import state
from .paths import use_test_path

logger = logging.getLogger(__name__)


def available_space() -> str:
    logger.debug("Function: available_space()")
    out = run_command("df --block-size=1 --output=avail '/'", timeout=2).splitlines()

    if use_test_path():
        return "1000000000000"

    if len(out) == 2:
        space = out[1].strip()
    else:
        space = ""

    logger.debug(f"Available Space: '{space}'")
    return space


def configure_landing() -> None:
    logger.debug("Function: configure_landing()")
    try:
        run_command(
            f"ln -s {path.dirname(path.realpath(__file__))}/../../resources/pt-os-landing.desktop /etc/xdg/autostart",
            timeout=60,
            lower_priority=True,
        )
    except Exception as e:
        logger.error(f"configure_tour: {e}")


def deprioritise_openbox_session() -> None:
    logger.debug("Function: deprioritise_openbox_session()")
    run_command(
        "update-alternatives --install /usr/bin/x-session-manager "
        + "x-session-manager /usr/bin/openbox-session 40",
        timeout=30,
        lower_priority=True,
    )


def stop_onboarding_autostart() -> None:
    logger.debug("Function: stop_onboarding_autostart()")
    try:
        remove("/etc/xdg/autostart/pt-os-setup.desktop")
        state.set("app", "onboarded", "true")
    except FileNotFoundError:
        logger.debug("stop_onboarding_autostart: Onboarding already disabled")
    except Exception as e:
        logger.error(f"stop_onboarding_autostart: {e}")


def enable_firmware_updater_service():
    logger.debug("Function: enable_firmware_updater()")

    return run_command(
        "systemctl enable pt-firmware-updater", timeout=30, lower_priority=True
    )


def enable_further_link_service():
    logger.debug("Function: enable_further_link()")

    return run_command("systemctl enable further-link", timeout=30, lower_priority=True)


def fw_update_is_due():
    logger.debug("Function: fw_update_is_due()")

    return path.exists("/tmp/.com.pi-top.pi-topd.pt-poweroff.reboot-on-shutdown")


def reboot() -> None:
    logger.debug("Function: reboot()")
    if fw_update_is_due():
        # Do shutdown, let hub start back up
        run_command_background("shutdown -h now")
    else:
        run_command_background("reboot")


def enable_pt_miniscreen():
    logger.debug("Function: enable_pt_miniscreen()")

    return run_command(
        "systemctl enable pt-miniscreen", timeout=30, lower_priority=True
    )


def restore_files():
    logger.debug("Function: restore_files()")

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
        logger.debug("restore_files: Files already restored")
    except Exception as e:
        logger.error(f"restore_files: {e}")


def disable_landing():
    logger.debug("Function: disable_landing()")
    try:
        remove("/etc/xdg/autostart/pt-os-landing.desktop")
    except FileNotFoundError:
        logger.debug("Landing already disabled.")


def python_sdk_docs_url():
    logger.debug("Function: python_sdk_docs_url()")
    return run_command("pi-top support links docs -p", timeout=10, check=False).strip()


def onboarding_completed():
    return state.get("app", "onboarded", fallback="false") == "true"


def update_eeprom():
    logger.debug("Function: update_eeprom()")
    try:
        run_command(
            "/usr/lib/pt-os-notify-services/pt-eeprom -f", timeout=10, check=False
        )
    except Exception as e:
        logger.error(f"update_eeprom: {e}")


def do_firmware_update():
    if device_type() != DeviceName.pi_top_4.value:
        return

    fw_dev_id_str = "pt4_hub"

    try:
        update_firmware(fw_dev_id_str, force=False, notify_user=False)
    except Exception as e:
        logger.warning(f"do_firmware_update: {e}")

    if not FirmwareDevice(
        FirmwareDevice.str_name_to_device_id(fw_dev_id_str)
    ).get_check_fw_okay():
        return

    run_command(
        "touch /tmp/.com.pi-top.pi-topd.pt-poweroff.reboot-on-shutdown",
        timeout=10,
    )


def set_hub_to_mode_5():
    logger.debug("Function: set_hub_to_mode_5()")
    ID__MCU_SOFT_VERS_MAJOR = 0xE0
    PWR__SHUTDOWN_CTRL_REG = 0xA0

    if device_type() != DeviceName.pi_top_4.value:
        logger.info("Device isn't a pi-top [4] - skipping...")
        return

    try:
        i2c_device = I2CDevice("/dev/i2c-1", 0x11)
        i2c_device.set_delays(0.001, 0.001)
        i2c_device.connect()
    except Exception as e:
        logger.debug(f"Error: {e}")
        return

    if int(i2c_device.read_unsigned_byte(ID__MCU_SOFT_VERS_MAJOR)) > 3:
        logger.info("Setting hub to mode 5...")
        full_byte = i2c_device.read_unsigned_byte(PWR__SHUTDOWN_CTRL_REG)
        full_byte = set_bits_low(0b00010000, full_byte)
        full_byte = set_bits_high(0b00101000, full_byte)
        logger.debug(
            f"Writing {bin(full_byte)} to register '{hex(PWR__SHUTDOWN_CTRL_REG)}'"
        )
        i2c_device.write_byte(PWR__SHUTDOWN_CTRL_REG, full_byte)
