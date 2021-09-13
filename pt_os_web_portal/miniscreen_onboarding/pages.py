from enum import Enum, auto
from time import perf_counter

from PIL import Image, ImageDraw, ImageFont
from pitop.common.sys_info import (
    get_address_for_connected_device,
    is_connected_to_internet,
)

from .event import AppEvents, subscribe


class Pages(Enum):
    WELCOME = auto()
    AP = auto()
    BROWSER = auto()
    CARRY_ON = auto()


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

    @property
    def visible(self):
        return True

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
        draw.multiline_text(
            text=self.text,
            xy=(0, 0),
            fill=1,
            font=ImageFont.truetype(
                "Roboto-Regular.ttf",
                size=12,
            ),
            anchor=None,
            spacing=0,
            align="left",
            features=None,
        )


class WelcomePage(PageBase):
    def __init__(self, size, mode):
        super(WelcomePage, self).__init__(
            type=Pages.WELCOME,
            size=size,
            mode=mode,
        )
        self.text = "Press the blue\ndown key\nto page!"


class ApPage(PageBase):
    def __init__(self, size, mode):
        super(ApPage, self).__init__(
            type=Pages.AP,
            size=size,
            mode=mode,
        )

        self.ssid = ""
        self.passphrase = ""

        def update_ssid(ssid):
            self.ssid = ssid

        subscribe(AppEvents.AP_HAS_SSID, update_ssid)

        def update_passphrase(passphrase):
            self.passphrase = passphrase

        subscribe(AppEvents.AP_HAS_PASSPHRASE, update_passphrase)

    @property
    def text(self):
        return f"Wi-Fi network:\n{self.ssid}\n{self.passphrase}"


class OpenBrowserPage(PageBase):
    def __init__(self, size, mode):
        super(OpenBrowserPage, self).__init__(
            type=Pages.BROWSER,
            size=size,
            mode=mode,
        )

        self.text = "Open a browser to http://pi-top.local or http://192.168.64.1"

    @property
    def visible(self):
        return get_address_for_connected_device() != "" or is_connected_to_internet()


class CarryOnPage(PageBase):
    def __init__(self, size, mode):
        super(CarryOnPage, self).__init__(
            type=Pages.CARRY_ON,
            size=size,
            mode=mode,
        )

        def handle_ready_to_be_a_maker_event(ready):
            if self.type == Pages.CARRY_ON:
                self.visible = ready

        subscribe(AppEvents.READY_TO_BE_A_MAKER, handle_ready_to_be_a_maker_event)

        self.text = "Now, continue\nonboarding in\nthe browser"
        self.visible = False
