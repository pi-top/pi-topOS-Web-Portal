from enum import Enum


class PyWiFiConstant(Enum):
    IFACE_DISCONNECTED = 0
    IFACE_SCANNING = 1
    IFACE_INACTIVE = 2
    IFACE_CONNECTING = 3
    IFACE_CONNECTED = 4

    # Define auth algorithms.
    AUTH_ALG_OPEN = 0
    AUTH_ALG_SHARED = 1

    # Define auth key mgmt types.
    AKM_TYPE_NONE = 0
    AKM_TYPE_WPA = 1
    AKM_TYPE_WPAPSK = 2
    AKM_TYPE_WPA2 = 3
    AKM_TYPE_WPA2PSK = 4
    AKM_TYPE_UNKNOWN = 5

    # Define ciphers.
    CIPHER_TYPE_NONE = 0
    CIPHER_TYPE_WEP = 1
    CIPHER_TYPE_TKIP = 2
    CIPHER_TYPE_CCMP = 3
    CIPHER_TYPE_UNKNOWN = 4

    KEY_TYPE_NETWORKKEY = 0
    KEY_TYPE_PASSPHRASE = 1


class PyWiFiUtil:
    def _send_cmd_to_wpas(self, iface, cmd, get_reply=False):
        pass


class PyWiFiProfile:
    def __init__(self, profile):
        self.id = profile["id"]
        self.auth = profile["auth"]
        self.akm = profile["akm"]
        self.cipher = profile["cipher"]
        self.ssid = profile["ssid"]
        self.bssid = profile["bssid"]
        self.key = profile["key"]
        self.freq = profile["freq"]
        self.signal = profile["signal"]


class PyWiFiInterfaceMock:
    state = PyWiFiConstant.IFACE_INACTIVE
    results = []

    def __init__(self):
        self._wifi_ctrl = PyWiFiUtil()

    def name(self):
        return "wlan0"

    def disconnect(self):
        self.state = PyWiFiConstant.IFACE_DISCONNECTED

    def status(self):
        return self.state.value

    def connect(self, profile):
        self.state = PyWiFiConstant.IFACE_CONNECTED

    def scan(self):
        self.state = PyWiFiConstant.IFACE_SCANNING

        profiles = [
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'Depto 606-5G',
                'bssid': 'e0:cc:7a:fd:84:50', 'key': None, 'freq': 5220, 'signal': -70},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'Depto 606',
             'bssid': 'e0:cc:7a:fd:84:4c', 'key': None, 'freq': 2447, 'signal': -52},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'VTR-5737196',
             'bssid': 'c0:05:c2:68:46:69', 'key': None, 'freq': 2437, 'signal': -57},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'VTR-5737196',
             'bssid': 'c0:05:c2:68:46:6f', 'key': None, 'freq': 5805, 'signal': -81},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'VTR-2049450',
             'bssid': 'e4:57:40:99:ee:15', 'key': None, 'freq': 5765, 'signal': -83},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'VTR-7138797 - 5G',
             'bssid': 'e4:57:40:35:da:0b', 'key': None, 'freq': 5745, 'signal': -86},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'VTR-3847319',
             'bssid': '40:0d:10:eb:e4:77', 'key': None, 'freq': 5180, 'signal': -90},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'Paraya_5G',
             'bssid': 'e4:57:40:92:22:15', 'key': None, 'freq': 5240, 'signal': -90},
            {'id': 0, 'auth': 0, 'akm': [2, 4], 'cipher': 0, 'ssid': 'Martina -1-5G',
             'bssid': '18:35:d1:20:98:5f', 'key': None, 'freq': 5200, 'signal': -92},
            {'id': 0, 'auth': 0, 'akm': [], 'cipher': 0, 'ssid': 'Free internet!',
             'bssid': '18:35:d1:20:98:5f', 'key': None, 'freq': 5200, 'signal': -92}
        ]

        self.results = [PyWiFiProfile(profile) for profile in profiles]

        self.state = PyWiFiConstant.IFACE_INACTIVE

    def scan_results(self):
        return self.results

    def remove_all_network_profiles(self):
        self.state = PyWiFiConstant.IFACE_INACTIVE

    def ssid_connected(self):
        return ''

    def add_network_profile(self, profile):
        pass


class PyWiFiInstanceMock:
    def interfaces(self):
        return [PyWiFiInterfaceMock()]


class PyWiFiMock:
    const = PyWiFiConstant

    def PyWiFi(self):
        return PyWiFiInstanceMock()
