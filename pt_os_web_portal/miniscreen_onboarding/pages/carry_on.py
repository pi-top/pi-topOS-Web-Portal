from .attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from .base._base import PageBase
from .pages import Pages
from .render.helpers import draw_text


class CarryOnPage(PageBase):
    def __init__(self, size, mode):
        super(CarryOnPage, self).__init__(
            type=Pages.CARRY_ON,
            size=size,
            mode=mode,
        )
        self.visible = False

    def render(self, draw):
        draw_text(
            draw,
            text="Now, continue",
            xy=(10, FIRST_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="onboarding in",
            xy=(10, SECOND_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="the browser",
            xy=(10, THIRD_LINE_Y),
            font_size=14,
        )
