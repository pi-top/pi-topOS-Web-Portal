import logging

from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (120, 64)
TEXT_POS = (0, 0)


class StartPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="Welcome to your pi-top! Press DOWN to continue...",
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
