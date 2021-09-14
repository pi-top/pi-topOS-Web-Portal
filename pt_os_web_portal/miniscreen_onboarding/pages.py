from enum import Enum, auto
from time import perf_counter

from PIL import Image, ImageDraw, ImageFont

from ..event import AppEvents, subscribe


class Page(Enum):
    WELCOME = auto()
    START_WIRELESS_CONNECTION = auto()
    SCREEN_KEYBOARD_NOTICE_PAGE = auto()
    HELP_URL = auto()
    GET_DEVICE = auto()
    OPEN_DEVICE_WIFI_SETTINGS = auto()
    SELECT_PITOP_WIFI_NETWORK = auto()
    ENTER_PITOP_WIFI_NETWORK_PASWORD = auto()
    WAITING_FOR_AP_CONNECTION = auto()
    OPEN_BROWSER = auto()
    CARRY_ON = auto()


class PageGenerator:
    @staticmethod
    def get_page(page_type: Page):
        pages = {
            Page.WELCOME: WelcomePage,
            Page.START_WIRELESS_CONNECTION: StartWirelessConnectionPage,
            Page.SCREEN_KEYBOARD_NOTICE_PAGE: ScreenKeyboardNoticePage,
            Page.HELP_URL: HelpURLPage,
            Page.GET_DEVICE: GetDevicePage,
            Page.OPEN_DEVICE_WIFI_SETTINGS: OpenDeviceWiFiSettingsPage,
            Page.SELECT_PITOP_WIFI_NETWORK: SelectPitopWifiNetworkPage,
            Page.ENTER_PITOP_WIFI_NETWORK_PASWORD: EnterPitopWifiNetworkPaswordPage,
            Page.WAITING_FOR_AP_CONNECTION: WaitingForAPConnectionPage,
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
        self._visible = True
        self.font_size = 14
        self.wrap = True

    @property
    def visible(self):
        return self._visible

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


class WelcomePage(PageBase):
    """
    Hi!
    Press any button
    to get started!
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.WELCOME, size=size, mode=mode, interval=interval)
        self.text = "Hi!\nPress any button\nto get started!"
        self.wrap = False


class StartWirelessConnectionPage(PageBase):
    """
    Press SELECT (O) to start wireless connection...
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.START_WIRELESS_CONNECTION, size=size, mode=mode, interval=interval
        )
        self.text = "Press SELECT (O) to start wireless connection..."


class ScreenKeyboardNoticePage(PageBase):
    """
    NOTE: not required if you are using a screen and keyboard!
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.SCREEN_KEYBOARD_NOTICE_PAGE,
            size=size,
            mode=mode,
            interval=interval,
        )
        self.text = "NOTE: this is not required if you are using a screen and keyboard!"
        self.font_size = 13


class HelpURLPage(PageBase):
    """
    If you get stuck, visit
    pi-top.com/start-4

    Press SELECT to continue
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.HELP_URL, size=size, mode=mode, interval=interval)
        self.text = "Detailed instructions are available at pi-top.com/start-4"


class GetDevicePage(PageBase):
    """
    You will need a phone, tablet or laptop...
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.GET_DEVICE, size=size, mode=mode, interval=interval)
        self.text = "You will need a phone, tablet or laptop to connect..."


class OpenDeviceWiFiSettingsPage(PageBase):
    """
    Now find the device's list of available Wi-Fi networks...
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.OPEN_DEVICE_WIFI_SETTINGS, size=size, mode=mode, interval=interval
        )
        self.text = "Now find the device's list of available Wi-Fi networks..."


class SelectPitopWifiNetworkPage(PageBase):
    """
    Find the 'pi-top' Wi-Fi network in the list and select...
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.SELECT_PITOP_WIFI_NETWORK, size=size, mode=mode, interval=interval
        )

        self.ssid = ""

        def update_ssid(ssid):
            self.ssid = ssid

        subscribe(AppEvents.AP_HAS_SSID, update_ssid)

    @property
    def text(self):
        return f"Find the '{self.ssid}' Wi-Fi network in the list and select..."


class EnterPitopWifiNetworkPaswordPage(PageBase):
    """
    Enter the password
    '{password}'
    and connect...!
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.ENTER_PITOP_WIFI_NETWORK_PASWORD,
            size=size,
            mode=mode,
            interval=interval,
        )

        self.passphrase = ""

        def update_passphrase(passphrase):
            self.passphrase = passphrase

        subscribe(AppEvents.AP_HAS_PASSPHRASE, update_passphrase)

    @property
    def text(self):
        return f"Enter password:\n'{self.passphrase}'\nand connect..."


class WaitingForAPConnectionPage(PageBase):
    """
    Waiting for connection...
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.WAITING_FOR_AP_CONNECTION, size=size, mode=mode, interval=interval
        )
        self.text = "Waiting for\nconnection..."


class OpenBrowserPage(PageBase):
    # TODO: integrate "waiting for AP connection..." into this page
    # Instead of automatic transition, just update the page's contents

    """
    Visit in browser:
    http://pi-top.local
    or
    http://192.168.64.1
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=Page.OPEN_BROWSER, size=size, mode=mode, interval=interval
        )

        self.text = "Go to\nhttp://pi-top.local\nor\nhttp://192.168.64.1"
        self.wrap = False

        self.has_connected_device = False

        def update_has_connected_device(has_connected_device):
            self.has_connected_device = has_connected_device

        subscribe(AppEvents.HAS_CONNECTED_DEVICE, update_has_connected_device)

        self.is_connected_to_internet = False

        def update_is_connected(is_connected):
            self.is_connected_to_internet = is_connected

        subscribe(AppEvents.IS_CONNECTED_TO_INTERNET, update_is_connected)

    @property
    def visible(self):
        return self.has_connected_device or self.is_connected_to_internet


class CarryOnPage(PageBase):
    """
    pi-top Connection Assistant:
    Completed
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=Page.CARRY_ON, size=size, mode=mode, interval=interval)
        self.text = "That's it!\nContinue in the browser..."
