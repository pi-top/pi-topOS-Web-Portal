import logging
from os import path
from pathlib import Path
from subprocess import run

from pitop.common.sys_info import get_pi_top_ip
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import Image, Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


class StartPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="Welcome to your\npi-top! Press DOWN\nto continue...",
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            wrap=False,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class GetDevicePage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="You will need a\nlaptop/computer\nto connect...",
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class HelpURLPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="Need more\nguidance?\npi-top.com/start-4",
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            wrap=False,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class ConnectPitopWifiNetworkPage(Component):
    ssid = ""
    passphrase = ""

    def __init__(self, **kwargs):
        super().__init__(
            initial_state={
                "ssid": self.ssid,
                "passphrase": self.passphrase,
            },
            **kwargs,
        )

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            spacing=4,
        )

        image_dir_path = path.abspath(
            path.join(Path(__file__).parent.resolve().parent.resolve(), "images")
        )
        self.ssid_icon = self.create_child(
            Image,
            image_path=path.join(image_dir_path, "wifi.png"),
        )
        self.passphrase_text = self.create_child(
            Image,
            image_path=path.join(image_dir_path, "padlock.png"),
        )

    @property
    def text(self):
        return f"Connect to Wi-Fi:\n{self.state['ssid']}\n{self.state['passphrase']}"

    def render(self, image):
        wifi_icon_pos = (10, 2 * FONT_SIZE)
        passphrase_icon_pos = (14, 3 * FONT_SIZE) + 2
        icon_size = (FONT_SIZE, FONT_SIZE)

        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
                layer(self.ssid_icon.render, size=icon_size, pos=wifi_icon_pos),
                layer(
                    self.passphrase_text.render, size=icon_size, pos=passphrase_icon_pos
                ),
            ],
        )


class OpenBrowserPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.has_connected_device = False
        self.is_connected_to_internet = False

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
        )

    @property
    def text(self):
        hostname = run("hostname", encoding="utf-8", capture_output=True)
        hostname = hostname.stdout.strip()
        ip = get_pi_top_ip()

        txt = f"Open browser to\n{hostname}.local"
        if len(ip) > 0:
            txt += f"\nor\n{ip}"

        return txt

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class WaitConnectionPage(Component):

    has_connected_device = False
    is_connected_to_internet = False

    def __init__(self, **kwargs):
        super().__init__(
            initial_state={
                "has_connected_device": self.has_connected_device,
                "is_connected_to_internet": self.is_connected_to_internet,
            },
            **kwargs,
        )

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
        )

    @property
    def text(self):
        message = "No connection\ndetected,\nwaiting..."

        # page should transition, this text only shown if you return to it
        if self.state["has_connected_device"] or self.state["is_connected_to_internet"]:
            message = "You're connected!\nPress DOWN to\ncontinue..."
        return message

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class CarryOnPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="You've started\nthe onboarding!\nContinue in\nyour browser...",
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )
