import logging

from pitop.common.pt_os import get_pitopOS_info
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import Text
from pt_miniscreen.core.utils import apply_layers, layer, rectangle

from ....backend.helpers.device import firmware_version

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


class FwInfoPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        build_info = get_pitopOS_info()
        text = (
            f"pi-top Firmware: {firmware_version()}\n"
            + f"Schema: {build_info.schema_version}\n"
            + f"Run: {build_info.build_run_number}\n"
            + f"#: {build_info.build_commit}"
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
