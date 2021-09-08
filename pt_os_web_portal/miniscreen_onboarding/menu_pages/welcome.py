from ..menus import Menus
from ._title_base import TitleMenuPage
from .attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from .helpers import draw_text


class WelcomeMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(WelcomeMenuPage, self).__init__(
            type=Menus.WELCOME, size=size, mode=mode, title_image_filename="welcome.png"
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

    def render(self, draw, redraw=False):
        super(WelcomeMenuPage, self).render(draw, redraw)
