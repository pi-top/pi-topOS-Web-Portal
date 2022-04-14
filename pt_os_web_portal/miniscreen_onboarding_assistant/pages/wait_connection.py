import logging

from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (120, 64)
TEXT_POS = (0, 0)


class WaitConnectionPage(Component):
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
        message = "No connection\ndetected,\nwaiting..."

        # page should transition, this text only shown if you return to it
        if self.has_connected_device or self.is_connected_to_internet:
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
