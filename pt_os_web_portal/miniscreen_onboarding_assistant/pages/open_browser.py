import logging
from subprocess import run

from pitop.common.sys_info import get_pi_top_ip
from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (120, 64)
TEXT_POS = (0, 0)


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
        hostname = "pi-top"
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
