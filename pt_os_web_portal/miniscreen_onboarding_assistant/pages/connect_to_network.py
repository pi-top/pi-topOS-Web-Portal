import logging

from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (120, 64)
TEXT_POS = (0, 0)


class ConnectPitopWifiNetworkPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.ssid = "pi-top-EC900"

        def update_ssid(ssid):
            if ssid:
                self.ssid = ssid

        # subscribe(AppEvents.AP_HAS_SSID, update_ssid)

        self.passphrase = "pi-top1234"

        def update_passphrase(passphrase):
            if passphrase:
                self.passphrase = passphrase

        # subscribe(AppEvents.AP_HAS_PASSPHRASE, update_passphrase)

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
        )

    @property
    def text(self):
        return f"Connect to Wi-Fi:\n{self.ssid}\n{self.passphrase}"

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
