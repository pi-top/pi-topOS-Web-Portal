import logging

from pitop.common.command_runner import run_command

logger = logging.getLogger(__name__)


class WifiManager:
    def __init__(self, ifname="wlan0"):

        if self.is_managed_by_network_manager():
            from .network_manager_handler import NetworkManagerHandler

            self.handler = NetworkManagerHandler(ifname)
        else:
            from .wpa_supplicant_handler import WpaSupplicantManager

            self.handler = WpaSupplicantManager(ifname)

    def is_managed_by_network_manager(self):
        return (
            run_command("systemctl -q is-active dhcpcd", check=False, timeout=5).strip()
            == "active"
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
