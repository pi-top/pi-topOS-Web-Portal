import logging
from typing import Any, Dict, List

import nmcli

nmcli.set_lang("C.UTF-8")

logger = logging.getLogger(__name__)


class NetworkManagerHandler:
    def __init__(self, ifname: str = "wlan0"):
        self.ifname = ifname
        self.wifi_device = None
        for device in nmcli.device():
            if device.device == self.ifname:
                self.wifi_device = device
                break

        if self.wifi_device is None:
            raise Exception(f"Unable to find interface '{self.ifname}'")

    def is_connected(self) -> bool:
        return self.wifi_device is not None and self.wifi_device.state == "connected"

    def disconnect(self) -> None:
        for connection in nmcli.connections():
            if connection.device == self.ifname:
                nmcli.connection.delete(connection.name)
        logger.info("Disconnected")

    def ssid_to_display(self, network) -> str:  # type: ignore
        ssid = network.ssid
        if len(ssid) == 0:
            ssid = "[Hidden Network]"
        if network.freq >= 5000:
            ssid = f"{ssid} [5G]"
        return ssid

    def scan_and_get_results(self) -> List:
        networks: Dict[str, Any] = {}

        detected_networks = nmcli.device.wifi(ifname=self.ifname, rescan=True)

        for network in detected_networks:
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

        # don't rescan
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

        def do_connect():
            try:
                logger.info(
                    f"Deleting existing profile for '{network_profile.ssid}'..."
                )
                nmcli.connection.delete(network_profile.ssid)
            except Exception as e:
                logger.error(f"Error deleting network '{network_profile.ssid}': {e}")

            try:
                logger.info(f"Connecting to '{network_profile.ssid}'...")
                nmcli.device.wifi_connect(
                    ifname=self.ifname,
                    ssid=network_profile.ssid,
                    password=password,
                    wait=30,
                )
                return
            except Exception as e:
                logger.error(f"Error connecting: {e}")

            # If something failed, a connection is created anyway, which causes some issues.
            # We need to manually delete it
            try:
                nmcli.connection.delete(network_profile.ssid)
            except Exception as e:
                logger.error(f"Error deleting network '{network_profile.ssid}': {e}")

            logger.error(f"Couldn't connect to '{network_profile.ssid}'")

        from threading import Thread

        t = Thread(
            target=do_connect,
            args=(),
            daemon=True,
        )
        t.start()

    def bssid_connected(self) -> str:
        try:
            for connection in nmcli.device.wifi(ifname=self.ifname, rescan=False):
                if connection.in_use:
                    return connection.bssid
        except Exception:
            pass
        return ""

    def ssid_connected(self) -> str:
        try:
            for connection in nmcli.device.wifi(ifname=self.ifname, rescan=False):
                if connection.in_use:
                    return connection.ssid
        except Exception:
            pass
        return ""

    def connection_information(self) -> Dict:
        bssids_for_ssid: Dict = {}
        info = {
            "bssidsForSsid": [],
            "bssid": "",
            "ssid": "",
        }
        try:
            for connection in nmcli.device.wifi(ifname=self.ifname, rescan=False):
                if bssids_for_ssid.get(connection.ssid) is None:
                    bssids_for_ssid[connection.ssid] = []
                bssids_for_ssid[connection.ssid].append(connection.bssid)

                if connection.in_use:
                    info["bssid"] = connection.bssid
                    info["ssid"] = connection.ssid
            if info.get("ssid"):
                info["bssidsForSsid"] = bssids_for_ssid.get(info["ssid"], [])
        except Exception:
            pass
        return info

    def get_formatted_ssids(self):
        return [
            {
                "ssid": self.ssid_to_display(r),
                "passwordRequired": r.security != "",
                "bssid": r.bssid,
            }
            for r in self.scan_and_get_results()
        ]
