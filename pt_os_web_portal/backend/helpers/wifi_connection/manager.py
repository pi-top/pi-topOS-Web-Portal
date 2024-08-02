import logging
from typing import Dict

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


class WifiManager:
    def __init__(self, ifname="wlan0"):

        if self._is_managed_by_network_manager():
            from .network_manager_handler import NetworkManagerHandler

            self.handler = NetworkManagerHandler(ifname)
        else:
            from .wpa_supplicant_handler import WpaSupplicantHandler

            self.handler = WpaSupplicantHandler(ifname)

    def _is_managed_by_network_manager(self):
        from ..paths import use_test_path

        if use_test_path():
            return False

        return (
            run_command("systemctl is-active dhcpcd", check=False, timeout=5).strip()
            != "active"
        )

    def ssid_to_display(self):
        return self.handler.ssid_to_display()

    def scan_and_get_results(self):
        return self.handler.scan_and_get_results()

    def connect(self, bssid, pwd):
        return self.handler.connect(bssid, pwd)

    def is_connected(self):
        return self.handler.is_connected()

    def bssid_connected(self):
        return self.handler.bssid_connected()

    def get_formatted_ssids(self):
        return self.handler.get_formatted_ssids()

    def ssid_connected(self) -> str:
        return self.handler.ssid_connected()

    def connection_information(self) -> Dict:
        return self.handler.connection_information()
