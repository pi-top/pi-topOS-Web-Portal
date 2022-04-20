import logging

from pitop.common.sys_info import NetworkInterface, get_internal_ip
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import Text
from pt_miniscreen.core.utils import apply_layers, layer, rectangle

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


class NetworksPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    @property
    def text(self):
        ips = list()

        for iface in NetworkInterface:
            ip = get_internal_ip(iface.name)
            if ip.replace("Internet Addresses Not Found", ""):
                ips.append(ip)

        return "\n".join(ips)

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )
