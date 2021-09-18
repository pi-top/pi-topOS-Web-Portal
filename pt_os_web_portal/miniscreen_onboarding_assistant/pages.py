from enum import Enum, auto
from time import perf_counter

from PIL import Image, ImageDraw, ImageFont

from ..event import AppEvents, subscribe


class Page(Enum):
    START = auto()
    WELCOME = auto()
    START_WIRELESS_CONNECTION = auto()
    HELP_URL = auto()
    GET_DEVICE = auto()
    CONNECT_PITOP_WIFI_NETWORK = auto()
    OPEN_BROWSER = auto()
    CARRY_ON = auto()


# TODO: replace with factory
class ScrollPageGenerator:
    @staticmethod
    def get_page(page_type: Page):
        pages = {
            Page.START: StartPage,
            Page.WELCOME: WelcomePage,
            Page.START_WIRELESS_CONNECTION: StartWirelessConnectionPage,
            Page.HELP_URL: HelpURLPage,
            Page.GET_DEVICE: GetDevicePage,
            Page.CONNECT_PITOP_WIFI_NETWORK: ConnectPitopWifiNetworkPage,
            Page.OPEN_BROWSER: OpenBrowserPage,
            Page.CARRY_ON: CarryOnPage,
        }

        return pages[page_type]


# Based on luma.core hotspots/snapshots
class PageBase:
    def __init__(self, type, size=(0, 0), mode=0, interval=1):
        self.type = type
        self.size = size
        self.width = size[0]
        self.height = size[1]
        self.mode = mode
        self.interval = interval
        self.last_updated = -self.interval
        self.visible = True
        self.font_size = 14
        self.wrap = True

    def should_redraw(self):
        """
        Only requests a redraw after ``interval`` seconds have elapsed.
        """
        return perf_counter() - self.last_updated > self.interval

    def paste_into(self, image, xy):
        im = Image.new(image.mode, self.size)
        draw = ImageDraw.Draw(im)
        self.render(draw)
        image.paste(im, xy)
        del draw
        del im
        self.last_updated = perf_counter()

    def render(self, draw):
        def text_wrap(text, font, max_width):
            """Wrap text base on specified width.
            This is to enable text of width more than the image width to be display
            nicely.
            @params:
                text: str
                    text to wrap
                font: obj
                    font of the text
                max_width: int
                    width to split the text with
            @return
                lines: list[str]
                    list of sub-strings
            """
            lines = []

            # If the text width is smaller than the image width, then no need to split
            # just add it to the line list and return
            if font.getsize(text)[0] <= max_width:
                lines.append(text)
            else:
                # split the line by spaces to get words
                words = text.split(" ")
                i = 0
                # append every word to a line while its width is shorter than the image width
                while i < len(words):
                    line = ""
                    while (
                        i < len(words) and font.getsize(line + words[i])[0] <= max_width
                    ):
                        line = line + words[i] + " "
                        i += 1
                    if not line:
                        line = words[i]
                        i += 1
                    lines.append(line)
            return lines

        font = ImageFont.truetype(
            "Roboto-Regular.ttf",
            size=self.font_size,
        )

        if self.wrap:
            text = "\n".join(text_wrap(self.text, font, self.size[0]))
        else:
            text = self.text

        draw.text(
            text=text,
            xy=(self.width / 2, self.height / 2),
            fill=1,
            font=font,
            anchor="mm",
            spacing=0,
            align="center",
            features=None,
        )


# Special pages - not used in scrolling
class SkipToEndPage(PageBase):
    """
    Press CANCEL (X) at any time to skip...
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=None, size=size, mode=mode, interval=interval)


class StartPage(PageBase):
    """
    Welcome! Let's get you set up, press any button to get started!
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.START, size=size, mode=mode, interval=interval)
        self.text = "Welcome to your pi-top! Press any button to get started..."


class WelcomePage(PageBase):
    """
    That's it!
    Now press DOWN to scroll...
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.WELCOME, size=size, mode=mode, interval=interval)
        self.text = "That's it!\nNow press DOWN to scroll..."


class StartWirelessConnectionPage(PageBase):
    """
    Awesome! Press DOWN to continue through pi-top connection setup...
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.START_WIRELESS_CONNECTION, size=size, mode=mode, interval=interval
        )
        self.text = "Awesome! Press DOWN to continue through pi-top connection setup..."


class HelpURLPage(PageBase):
    """
    Detailed setup instructions: pi-top.com/start-4

    Press SELECT to continue
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.HELP_URL, size=size, mode=mode, interval=interval)
        self.text = "Detailed setup instructions: pi-top.com/start-4"


class GetDevicePage(PageBase):
    """
    Let's get started! You will need a laptop/computer to connect with...
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.GET_DEVICE, size=size, mode=mode, interval=interval)
        self.text = (
            "Let's get started!\nYou will need a\nlaptop/computer\nto connect with..."
        )
        self.wrap = False


class ConnectPitopWifiNetworkPage(PageBase):
    """
    Connect to Wi-Fi network '{ssid}' using password '{passphrase}'
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.CONNECT_PITOP_WIFI_NETWORK,
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


class OpenBrowserPage(PageBase):
    # Default: "Waiting for connection...", then:
    """
    Open browser to
    http://pi-top.local
    or
    http://192.168.64.1
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.OPEN_BROWSER, size=size, mode=mode, interval=interval
        )
        self.wrap = False

        self.has_connected_device = False

        def update_has_connected_device(has_connected_device):
            self.has_connected_device = has_connected_device

        subscribe(AppEvents.HAS_CONNECTED_DEVICE, update_has_connected_device)

        self.is_connected_to_internet = False

        def update_is_connected(is_connected):
            self.is_connected_to_internet = is_connected

        subscribe(AppEvents.IS_CONNECTED_TO_INTERNET, update_is_connected)

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
        txt = "Waiting for\nconnection..."

        if self.has_connected_device or self.is_connected_to_internet:
            txt = "Open browser to\nhttp://pi-top.local\nor\nhttp://192.168.64.1"

        return txt


class CarryOnPage(PageBase):
    """
    You've started the onboarding!
    Continue in your browser...
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.CARRY_ON, size=size, mode=mode, interval=interval)
        self.text = "You've started the onboarding!\nContinue in your browser..."
        self.visible = False

        def update_visible(visible):
            self.visible = visible

        subscribe(AppEvents.READY_TO_BE_A_MAKER, update_visible)
