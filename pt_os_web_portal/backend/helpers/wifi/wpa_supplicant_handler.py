import logging
from enum import Enum
from time import sleep
from typing import Any, Dict, List

from ..modules import get_pywifi

logger = logging.getLogger(__name__)

pywifi = get_pywifi()


class IfaceStatus(Enum):
    DISCONNECTED = 0
    SCANNING = 1
    INACTIVE = 2
    CONNECTING = 3
    CONNECTED = 4


class WpaSupplicantManager:
    def __init__(self, ifname):
        self.ifname = ifname
        self.wifi_interface = self.get_interface(self.ifname)

    @staticmethod
    def get_interface(iface_name: str):
        logger.info("Attempting to get interface '%s'" % iface_name)

        for i in pywifi.PyWiFi().interfaces():
            logger.debug(f"Checking against '{i.name()}'")
            if i.name() == iface_name:
                logger.info(f"Successfully got interface '{iface_name}'")
                return i

        # No wlan0 interface - is this an old Pi?
        raise Exception(f"Unable to find interface '{iface_name}'")

    def get_status(self) -> IfaceStatus:
        status_int = self.wifi_interface.status()

        if status_int == 0:
            return IfaceStatus.DISCONNECTED
        elif status_int == 1:
            return IfaceStatus.SCANNING
        elif status_int == 2:
            return IfaceStatus.INACTIVE
        elif status_int == 3:
            return IfaceStatus.CONNECTING
        elif status_int == 4:
            return IfaceStatus.CONNECTED
        return IfaceStatus.DISCONNECTED

    def is_inactive(self) -> bool:
        return self.get_status() in (IfaceStatus.DISCONNECTED, IfaceStatus.INACTIVE)

    def is_connecting(self) -> bool:
        return self.get_status() == IfaceStatus.CONNECTING

    def is_connected(self) -> bool:
        return self.get_status() == IfaceStatus.CONNECTED

    def is_scanning(self) -> bool:
        return self.get_status() == IfaceStatus.SCANNING

    @staticmethod
    def wait_for(
        condition_func,
        description=None,
        condition_true: bool = True,
        timeout: int = 30,
        silent: bool = False,
    ) -> None:
        sleep_time = 0.1
        time_waited = 0.0

        while not condition_func() if condition_true else condition_func():
            text = "Waiting"
            if description is not None:
                text += " for %s" % description
            text += " - sleeping for %.1f. Total: %.1f / %is" % (
                sleep_time,
                time_waited,
                timeout,
            )
            if not silent:
                logger.info(text)
            sleep(sleep_time)
            time_waited += sleep_time
            if time_waited >= timeout:
                raise Exception("Waited too long for %s" % description)

    def disconnect(self) -> None:
        if not self.is_inactive():
            logger.info("Disconnecting interface")
            self.wifi_interface.disconnect()
            self.wait_for(self.is_inactive, "disconnection")
        logger.info("Interface disconnected")

    def ssid_to_display(self, network_profile) -> str:  # type: ignore
        ssid = network_profile.ssid
        if len(ssid) == 0:
            ssid = "[Hidden Network]"
        if network_profile.freq >= 5000:
            ssid = f"{ssid} [5G]"
        return ssid

    def scan_and_get_results(self) -> List:
        if not self.is_scanning():
            logger.info("Starting networks scan")
            self.wifi_interface.scan()

            self.wait_for(
                self.is_scanning, "scan completion", condition_true=False, silent=True
            )
        logger.info("Scan completed")

        networks: Dict[str, Any] = {}
        for network in self.wifi_interface.scan_results():
            ssid_to_display = self.ssid_to_display(network)
            if (
                ssid_to_display in networks
                and getattr(networks[ssid_to_display], "signal", -100) > network.signal
            ):
                continue
            networks[ssid_to_display] = network
        logger.info(f"Found SSIDs: {tuple(networks.keys())}")
        self.scan_results = [networks[ssid_to_display] for ssid_to_display in networks]
        return self.scan_results

    def connect(self, bssid: str, password: str) -> None:
        network_profile = None

        # don't rescan if we've already done one
        results = (
            hasattr(self, "scan_results")
            and self.scan_results
            or self.scan_and_get_results()
        )

        for r in results:
            if r.bssid == bssid:
                network_profile = r
                break
        if network_profile is None:
            raise Exception(f"Unable to find network matching BSSID '{bssid}'")

        network_profile.key = password
        if len(network_profile.akm) == 0:
            # fixes pywifi issues with networks without security
            network_profile.akm = [None]
        self.disconnect()

        logger.info("Removing all network profiles")
        self.wifi_interface.remove_all_network_profiles()

        self.wait_for(self.is_inactive, "interface to become inactive")

        logger.info("Connecting to newly created profile")
        self.wifi_interface.connect(
            self.wifi_interface.add_network_profile(network_profile)
        )

        self.wait_for(self.is_connected, "connection", silent=True)

        logger.info("Updating wpa_supplicant.conf with network data")
        self.wifi_interface._wifi_ctrl._send_cmd_to_wpas(
            self.ifname, "SAVE_CONFIG", False
        )

    def bssid_connected(self) -> str:
        try:
            if self.get_status() != IfaceStatus.CONNECTED:
                return ""

            # query the network to wpa_cli
            response = self.wifi_interface._wifi_ctrl._send_cmd_to_wpas(
                self.ifname, "STATUS", True
            )
            for line in response.split("\n"):
                if line.startswith("bssid="):
                    return line.replace("bssid=", "")
        except Exception:
            pass
        return ""

    def get_formatted_ssids(self):
        logger.info("GETTING LIST OF SSIDS")
        return [
            {
                "ssid": self.ssid_to_display(r),
                "passwordRequired": len(r.akm) != 0
                and pywifi.const.AKM_TYPE_NONE not in r.akm,
                "bssid": r.bssid,
            }
            for r in self.scan_and_get_results()
        ]
