from .attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from .base._title_base import TitlePage
from .pages import Pages
from .render.helpers import draw_text


class CarryOnPage(TitlePage):
    def __init__(self, size, mode):
        super(CarryOnPage, self).__init__(
            type=Pages.CARRY_ON,
            size=size,
            mode=mode,
            title_image_filename="carryon.png",
        )
        self.visible = False

    def info(self, draw, redraw=False):
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
