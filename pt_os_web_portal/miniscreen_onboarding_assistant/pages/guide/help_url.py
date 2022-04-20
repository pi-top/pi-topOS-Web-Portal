import logging

from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


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
