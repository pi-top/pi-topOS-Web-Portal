from enum import Enum
from time import sleep
from typing import Dict, List

from pitopcommon.logger import PTLogger

from .command_runner import run_command
from .modules import get_pywifi

pywifi = get_pywifi()


class IfaceStatus(Enum):
    DISCONNECTED = 0
    SCANNING = 1
    INACTIVE = 2
    CONNECTING = 3
    CONNECTED = 4


class WifiManager:
    RPI_WLAN_INTERFACE = "wlan0"

    def __init__(self):
        self.wifi_interface = self.get_interface(self.RPI_WLAN_INTERFACE)

    @staticmethod
    def get_interface(iface_name: str):
        PTLogger.info("Attempting to get interface '%s'" % iface_name)

        for i in pywifi.PyWiFi().interfaces():
            PTLogger.debug(f"Checking against '{i.name()}'")
            if i.name() == iface_name:
                PTLogger.info("Successfully got interface '%s'" % iface_name)
                return i

        # No wlan0 interface - is this an old Pi?
        raise Exception("Unable to find %s" % iface_name)

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
        time_waited = 0

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
                PTLogger.info(text)
            sleep(sleep_time)
            time_waited += sleep_time
            if time_waited >= timeout:
                raise Exception("Waited too long for %s" % description)

    def disconnect(self) -> None:
        if not self.is_inactive():
            PTLogger.info("Disconnecting interface")
            self.wifi_interface.disconnect()
            self.wait_for(self.is_inactive, "disconnection")
        PTLogger.info("Interface disconnected")

    def scan_and_get_results(self) -> List:
        if not self.is_scanning():
            PTLogger.info("Starting networks scan")
            self.wifi_interface.scan()

            WifiManager.wait_for(
                self.is_scanning, "scan completion", condition_true=False, silent=True
            )

        PTLogger.info("Scan completed")
        results = self.wifi_interface.scan_results()
        PTLogger.info("ssids found: {}".format([r.ssid for r in results]))
        return results

    def connect(self, ssid: str, password: str) -> None:
        network_profile = None
        for r in self.scan_and_get_results():
            if r.ssid == ssid:
                network_profile = r
                break

        if network_profile is None:
            PTLogger.info("Unable to find network matching SSID '%s'" % ssid)
            return

        network_profile.key = password
        if len(network_profile.akm) == 0:
            # fixes pywifi issues with networks without security
            network_profile.akm = [None]
        self.disconnect()

        PTLogger.info("Removing all network profiles")
        self.wifi_interface.remove_all_network_profiles()

        WifiManager.wait_for(self.is_inactive, "interface to become inactive")

        PTLogger.info("Connecting to newly created profile")
        self.wifi_interface.connect(
            self.wifi_interface.add_network_profile(network_profile)
        )

        WifiManager.wait_for(self.is_connected, "connection", silent=True)

        if self.is_connected():
            PTLogger.info("Updating wpa_supplicant.conf with network data")
            self.wifi_interface._wifi_ctrl._send_cmd_to_wpas(
                self.RPI_WLAN_INTERFACE, "SAVE_CONFIG", False
            )
            self.wifi_interface._wifi_ctrl._send_cmd_to_wpas(
                self.RPI_WLAN_INTERFACE, "RECONFIGURE", False
            )
            PTLogger.info("Waiting for interface to become connected again")
            WifiManager.wait_for(self.is_connected, "connection", silent=True)

    def ssid_connected(self) -> str:
        try:
            if self.get_status() == IfaceStatus.CONNECTED:
                response = self.wifi_interface._wifi_ctrl._send_cmd_to_wpas(
                    self.RPI_WLAN_INTERFACE, "STATUS", True
                )
                for line in response.split("\n"):
                    if line.startswith("ssid="):
                        return line.replace("ssid=", "")
        except Exception:
            pass
        return ""


# Global instance
wifi_manager = None


def get_wifi_manager_instance():
    global wifi_manager
    if wifi_manager is None:
        wifi_manager = WifiManager()
    return wifi_manager


def get_ssids() -> List[Dict]:
    wm = get_wifi_manager_instance()
    PTLogger.info("GETTING LIST OF SSIDS")
    return [
        {
            "ssid": r.ssid,
            "passwordRequired": len(r.akm) != 0
            and pywifi.const.AKM_TYPE_NONE not in r.akm,
        }
        for r in wm.scan_and_get_results()
    ]


def attempt_connection(ssid, password, on_connection=None) -> None:
    PTLogger.info("Attempting to connect to {}".format(ssid))
    wm = get_wifi_manager_instance()
    wm.connect(ssid, password)

    if wm.is_connected() and on_connection:
        PTLogger.info("Executing on_connection callback")
        on_connection()


def current_wifi_ssid() -> str:
    PTLogger.info("Attempting to determine to which SSID we're connected to")
    wm = get_wifi_manager_instance()
    return wm.ssid_connected()


def is_connected_to_internet() -> bool:
    try:
        PTLogger.info("Checking internet connection")
        run_command("ping -c1 8.8.8.8", timeout=10, check=True)
        PTLogger.info("Connected to internet")
        return True
    except Exception:
        PTLogger.info("Not connected to internet")
        return False
