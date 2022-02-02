from enum import Enum, auto
from subprocess import run

from pitop.miniscreen.oled.assistant import MiniscreenAssistant

from ...event import AppEvents, subscribe
from .base import PageBase


class GuidePageBase(PageBase):
    def __init__(self, type, size=(0, 0), mode=0, interval=1):
        super().__init__(type, size, mode, interval)

    def render(self, image):
        MiniscreenAssistant(self.mode, self.size).render_text(
            image,
            text=self.text,
            wrap=self.wrap,
            font_size=self.font_size,
        )


class GuidePage(Enum):
    START = auto()
    START_WIRELESS_CONNECTION = auto()
    GET_DEVICE = auto()
    HELP_URL = auto()
    CONNECT_PITOP_WIFI_NETWORK = auto()
    WAIT_CONNECTION = auto()
    OPEN_BROWSER = auto()
    CARRY_ON = auto()


class GuidePageGenerator:
    @staticmethod
    def get_page(page_type: GuidePage):
        pages = {
            GuidePage.START: StartPage,
            GuidePage.START_WIRELESS_CONNECTION: StartWirelessConnectionPage,
            GuidePage.GET_DEVICE: GetDevicePage,
            GuidePage.HELP_URL: HelpURLPage,
            GuidePage.CONNECT_PITOP_WIFI_NETWORK: ConnectPitopWifiNetworkPage,
            GuidePage.WAIT_CONNECTION: WaitConnectionPage,
            GuidePage.OPEN_BROWSER: OpenBrowserPage,
            GuidePage.CARRY_ON: CarryOnPage,
        }

        return pages[page_type]


class StartPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(type=GuidePage.START, size=size, mode=mode, interval=interval)
        self.text = "Welcome to your pi-top! Press DOWN to get started..."


class StartWirelessConnectionPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.START_WIRELESS_CONNECTION,
            size=size,
            mode=mode,
            interval=interval,
        )
        self.text = "Awesome! Press DOWN to continue through pi-top connection setup..."


class GetDevicePage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.GET_DEVICE, size=size, mode=mode, interval=interval
        )
        self.text = "You will need a\nlaptop/computer\nto connect..."
        self.wrap = False


class HelpURLPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.HELP_URL, size=size, mode=mode, interval=interval
        )
        self.text = "Detailed setup instructions: pi-top.com/start-4"


class ConnectPitopWifiNetworkPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.CONNECT_PITOP_WIFI_NETWORK,
            size=size,
            mode=mode,
            interval=interval,
        )
        self.font_size = 13
        self.wrap = False

        self.ssid = ""

        def update_ssid(ssid):
            self.ssid = ssid

        subscribe(AppEvents.AP_HAS_SSID, update_ssid)

        self.passphrase = ""

        def update_passphrase(passphrase):
            self.passphrase = passphrase

        subscribe(AppEvents.AP_HAS_PASSPHRASE, update_passphrase)

    @property
    def text(self):
        return f"Connect to\nWi-Fi network:\n'{self.ssid}'\n'{self.passphrase}'"


class WaitConnectionPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.WAIT_CONNECTION,
            size=size,
            mode=mode,
            interval=interval,
        )

        self.has_connected_device = False

        def update_has_connected_device(has_connected_device):
            self.has_connected_device = has_connected_device

        subscribe(AppEvents.HAS_CONNECTED_DEVICE, update_has_connected_device)

        self.is_connected_to_internet = False

        def update_is_connected(is_connected):
            self.is_connected_to_internet = is_connected

        subscribe(AppEvents.IS_CONNECTED_TO_INTERNET, update_is_connected)

        self.wrap = False

    @property
    def text(self):
        text = "No connection\ndetected,\nwaiting..."

        # page should transition, this text only shown if you return to it
        if self.has_connected_device or self.is_connected_to_internet:
            text = "You're connected!\nPress DOWN to\ncontinue..."
        return text


class OpenBrowserPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.OPEN_BROWSER, size=size, mode=mode, interval=interval
        )
        self.wrap = False

    # TODO: cycle through alternative IP addresses (e.g. Ethernet)
    # ip -4 addr [show eth0] | grep --only-matching --perl-regexp '(?<=inet\s)\d+(\.\d+){3}' | grep --invert-match 127.0.0.1

    # ip -4 addr  | grep -oP '(?<=inet\s)\d+(\.\d+){3}'

    # Refresh before each pass of IP addresses?
    # Refresh before showing an IP address in the list?

    # Try and get IP from eth0, use that
    # Try and get IP from wlan0, use that
    # Else AP/display cable IP

    @property
    def text(self):
        hostname = run("hostname", encoding="utf-8", capture_output=True)
        hostname = hostname.stdout.strip()
        txt = f"Open browser to\nhttp://{hostname}.local\nor\nhttp://192.168.64.1"

        return txt


class CarryOnPage(GuidePageBase):
    def __init__(self, size, mode, interval):
        super().__init__(
            type=GuidePage.CARRY_ON, size=size, mode=mode, interval=interval
        )
        self.wrap = False
        self.text = "You've started\nthe onboarding!\nContinue in\nyour browser..."
        self.visible = False

        def update_visible(visible):
            self.visible = visible

        subscribe(AppEvents.READY_TO_BE_A_MAKER, update_visible)
