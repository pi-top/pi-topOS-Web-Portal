from unittest.mock import Mock


class NmcliDeviceMock:
    def __init__(self):
        self.wlan0_mock = Mock(
            device="wlan0", device_type="wifi", state="disconnected", connection=None
        )
        self.networks = [
            Mock(
                in_use=False,
                ssid="DEPTO_1202",
                bssid="F0:9B:B8:2D:20:4C",
                mode="Infra",
                chan=11,
                freq=2462,
                rate=130,
                signal=64,
                security="WPA1 WPA2",
            ),
            Mock(
                in_use=False,
                ssid="DaniJo",
                bssid="E4:3E:C6:86:D6:54",
                mode="Infra",
                chan=6,
                freq=2437,
                rate=130,
                signal=57,
                security="WPA1 WPA2",
            ),
            Mock(
                in_use=False,
                ssid="DEPTO_1202",
                bssid="00:E4:06:76:AC:A4",
                mode="Infra",
                chan=11,
                freq=2462,
                rate=130,
                signal=55,
                security="WPA1 WPA2",
            ),
            Mock(
                in_use=False,
                ssid="DEPTO_1202",
                bssid="F0:9B:B8:2D:20:51",
                mode="Infra",
                chan=44,
                freq=5220,
                rate=540,
                signal=45,
                security="WPA1 WPA2",
            ),
            Mock(
                in_use=False,
                ssid="VTR-7939400",
                bssid="F4:23:9C:C4:77:12",
                mode="Infra",
                chan=6,
                freq=2437,
                rate=130,
                signal=44,
                security="WPA2",
            ),
            Mock(
                in_use=False,
                ssid="VTR-1187468",
                bssid="18:35:D1:8E:F1:A1",
                mode="Infra",
                chan=11,
                freq=2462,
                rate=130,
                signal=39,
                security="WPA1 WPA2",
            ),
            Mock(
                in_use=False,
                ssid="VTR-1187468",
                bssid="22:35:D1:8E:AE:11",
                mode="Infra",
                chan=11,
                freq=5462,
                rate=130,
                signal=41,
                security="WPA1 WPA2",
            ),
        ]

    def __call__(self, *args, **kwargs):
        return [
            self.wlan0_mock,
            Mock(
                device="ptusb0",
                device_type="ethernet",
                state="connected",
                connection="pi-top-usb",
            ),
            Mock(
                device="wlan_ap0",
                device_type="wifi",
                state="connected",
                connection="pi-top-ap",
            ),
            Mock(
                device="lo",
                device_type="loopback",
                state="connected",
                connection="(externally)  lo",
            ),
            Mock(
                device="p2p-dev-wlan0",
                device_type="wifi-p2p",
                state="disconnected",
                connection=None,
            ),
            Mock(
                device="p2p-dev-wlan_ap0",
                device_type="wifi-p2p",
                state="disconnected",
                connection=None,
            ),
            Mock(
                device="eth0",
                device_type="ethernet",
                state="unavailable",
                connection=None,
            ),
        ]

    def wifi(self, ifname, rescan=True, *args, **kwargs):
        return self.networks

    def wifi_connect(self, ifname, ssid, password, wait, *args, **kwargs):
        def get_wifi_network_index(ssid):
            for i, network in enumerate(self.networks):
                if network.ssid == ssid:
                    return i

        network_index = get_wifi_network_index(ssid)
        if network_index is None:
            raise Exception(f"Couldn't find network with SSID: {ssid}")
        if password != "valid-password":
            raise Exception("Invalid password")
        # Update connection state
        self.wlan0_mock.state = "connected"
        self.wlan0_mock.connection = ssid
        # Update network state
        self.networks[network_index].in_use = True


class NmcliMock:
    def __init__(self):
        self.device = NmcliDeviceMock()
