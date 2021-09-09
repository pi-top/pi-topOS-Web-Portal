from ...menus import Menus
from ..attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from ..base._title_base import TitleMenuPage
from ..render.helpers import draw_text


class CarryOnMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(CarryOnMenuPage, self).__init__(
            type=Menus.CARRY_ON,
            size=size,
            mode=mode,
            title_image_filename="carryon.png",
        )
        self.already_displayed = False

    def should_display(self):
        should = not self.skip and self.already_displayed is False
        if should:
            self.already_displayed = True
        return should

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
