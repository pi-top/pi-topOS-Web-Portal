import logging
from ipaddress import ip_address
from os import path
from typing import Dict

from pitop.common.command_runner import run_command, run_command_background
from pitop.common.common_names import DeviceName
from pitop.common.firmware_device import FirmwareDevice
from pitop.common.sys_info import (
    InterfaceNetworkData,
    NetworkInterface,
    get_address_for_ptusb_connected_device,
    get_internal_ip,
    interface_is_up,
)
from pitop.system import device_type
from pt_fw_updater.core.firmware_updater import PTInvalidFirmwareFile
from pt_fw_updater.update import main as update_firmware

from ... import state
from .landing import disable_first_boot_app
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


def deprioritise_openbox_session() -> None:
    logger.debug("Function: deprioritise_openbox_session()")
    run_command(
        "update-alternatives --install /usr/bin/x-session-manager "
        + "x-session-manager /usr/bin/openbox-session 40",
        timeout=30,
        lower_priority=True,
    )


def stop_first_boot_app_autostart() -> None:
    logger.debug("Function: stop_first_boot_app_autostart()")
    try:
        state.set("app", "onboarded", "true")
        disable_first_boot_app()
    except Exception as e:
        logger.error(f"stop_first_boot_app_autostart: {e}")


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
    for cmd in (
        "rsync -av /usr/lib/pt-os-web-portal/bak/ /",
        "rm -r /usr/lib/pt-os-web-portal/bak",
        "rm -r /lib/systemd/system/lightdm.service.d/99-openbox-for-onboarding.conf",
    ):
        try:
            run_command(cmd, timeout=30, lower_priority=True)
        except FileNotFoundError:
            logger.debug("restore_files: Files already restored")
        except Exception as e:
            logger.error(f"restore_files: {e}")


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
    except PTInvalidFirmwareFile as e:
        logger.warning(f"do_firmware_update: {e}")
        return
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


def disable_ap_mode() -> None:
    logger.info("Function disable_ap_mode()")
    try:
        run_command("/usr/bin/wifi-ap-sta disable", check=False, timeout=20)
    except Exception as e:
        logger.error(f"disable_ap_mode(): {e}")


def should_switch_network(request) -> Dict:
    logger.info("Function should_switch_network()")

    def get_non_ap_ip():
        for iface in ("wlan0", "eth0"):
            try:
                ip = ip_address(get_internal_ip(iface))
                return ip.exploded
            except ValueError:
                pass

        # ptusb0 interface always has an IP address, so check is performed differently
        if len(get_address_for_ptusb_connected_device()) > 0:
            return InterfaceNetworkData("ptusb0").ip.exploded

        return ""

    client_ip = ip_address(request.remote_addr)
    if hasattr(client_ip, "ipv4_mapped") and client_ip.ipv4_mapped:  # type: ignore
        # request.remote_addr is always an ipv6 address
        client_ip = client_ip.ipv4_mapped  # type: ignore

    pi_top_non_ap_ip = get_non_ap_ip()
    pi_top_ip = pi_top_non_ap_ip
    is_connected_only_through_ap = len(pi_top_non_ap_ip) == 0

    client_is_in_ap_network = False
    if interface_is_up(NetworkInterface.wlan_ap0.name):
        wlan_ap0_iface = InterfaceNetworkData(NetworkInterface.wlan_ap0.name)
        client_is_in_ap_network = client_ip in wlan_ap0_iface.network
        if len(pi_top_ip) == 0:
            pi_top_ip = wlan_ap0_iface.ip.exploded

    response = {
        "clientIp": client_ip.exploded,
        "piTopIp": pi_top_ip,
        "shouldSwitchNetwork": not is_connected_only_through_ap,
        "shouldDisplayDialog": device_type() == DeviceName.pi_top_4.value
        and client_is_in_ap_network,
    }
    logger.info(f"should_switch_network: {response}")
    return response
