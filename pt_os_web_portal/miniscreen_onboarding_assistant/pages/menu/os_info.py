import logging

from pitop.common.pt_os import get_pitopOS_info
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import Text
from pt_miniscreen.core.utils import apply_layers, layer, rectangle

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


class OsInfoPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        build_info = get_pitopOS_info()
        text = (
            f"pi-topOS v{build_info.build_os_version}\n"
            f"{build_info.build_type}\n" + f"{build_info.build_date}"
        )

        self.text_component = self.create_child(
            Text,
            text=text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

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
