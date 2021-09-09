from .attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from .base._title_base import TitlePage
from .pages import Pages
from .render.helpers import draw_text


class WelcomePage(TitlePage):
    def __init__(self, size, mode):
        super(WelcomePage, self).__init__(
            type=Pages.WELCOME,
            size=size,
            mode=mode,
            title_image_filename="welcome.png",
        )

    def info(self, draw, redraw=False):
        draw_text(
            draw,
            text="Press the blue",
            xy=(15, FIRST_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="down key",
            xy=(15, SECOND_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="to page!",
            xy=(15, THIRD_LINE_Y),
            font_size=14,
        )
