from enum import Enum
from time import perf_counter

from PIL import Image, ImageDraw, ImageFont

from ..event import AppEvents, subscribe


class Page(Enum):
    WELCOME = 0
    AP = 1
    BROWSER = 2
    CARRY_ON = 3


class PageGenerator:
    @staticmethod
    def get_page(page_type: Page):
        if page_type == Page.WELCOME:
            return WelcomePage

        elif page_type == Page.AP:
            return ApPage

        elif page_type == Page.BROWSER:
            return OpenBrowserPage

        elif page_type == Page.CARRY_ON:
            return CarryOnPage

        else:
            raise Exception("Invalid page type")


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
        draw.text(
            text=self.text,
            xy=(self.width / 2, self.height / 2),
            fill=1,
            font=ImageFont.truetype(
                "Roboto-Regular.ttf",
                size=12,
            ),
            anchor="mm",
            spacing=0,
            align="center",
            features=None,
        )


class WelcomePage(PageBase):
    def __init__(self, size, mode, interval):
        super(WelcomePage, self).__init__(
            type=Page.WELCOME,
            size=size,
            mode=mode,
            interval=interval,
        )
        self.text = "Press the blue\ndown key\nto page!"


class ApPage(PageBase):
    def __init__(self, size, mode, interval):
        super(ApPage, self).__init__(
            type=Page.AP,
            size=size,
            mode=mode,
            interval=interval,
        )

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
        return f"Wi-Fi network:\nSSID: {self.ssid}\nPassword: {self.passphrase}"


class OpenBrowserPage(PageBase):
    def __init__(self, size, mode, interval):
        super(OpenBrowserPage, self).__init__(
            type=Page.BROWSER,
            size=size,
            mode=mode,
            interval=interval,
        )

        self.text = "Open a browser\nto http://pi-top.local\nor http://192.168.64.1"

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
    def __init__(self, size, mode, interval):
        super(CarryOnPage, self).__init__(
            type=Page.CARRY_ON,
            size=size,
            mode=mode,
            interval=interval,
        )

        self.text = "Now, continue\nonboarding in\nthe browser"

        self._visible = False

        def update_ready(ready):
            self._visible = ready

        subscribe(AppEvents.READY_TO_BE_A_MAKER, update_ready)
