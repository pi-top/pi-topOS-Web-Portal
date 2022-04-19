import logging

from pt_miniscreen.core import Component
from pt_miniscreen.core.components.text import Text
from pt_miniscreen.core.utils import apply_layers, layer

logger = logging.getLogger(__name__)


FONT_SIZE = 13
SIZE = (120, 64)
TEXT_POS = (0, 0)


class WaitConnectionPage(Component):

    has_connected_device = False
    is_connected_to_internet = False

    def __init__(self, **kwargs):
        super().__init__(
            initial_state={
                "has_connected_device": self.has_connected_device,
                "is_connected_to_internet": self.is_connected_to_internet,
            },
            **kwargs
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
