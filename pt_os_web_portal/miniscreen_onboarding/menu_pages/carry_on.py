from pathlib import Path
from threading import Thread
from time import sleep

from ...backend.helpers.extras import started_onboarding_breadcrumb
from ..menus import Menus
from ._title_base import TitleMenuPage
from .attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from .render.helpers import draw_text


class CarryOnMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(CarryOnMenuPage, self).__init__(
            type=Menus.CARRY_ON,
            size=size,
            mode=mode,
            title_image_filename="carryon.png",
        )
        self.already_displayed = False
        self.thread = Thread(target=self.__monitor_breadcrumb, args=(), daemon=True)
        self.thread.start()

    def should_display(self):
        should = not self.skip and self.already_displayed is False
        if should:
            self.already_displayed = True
        return should

    def __monitor_breadcrumb(self):
        file = Path(started_onboarding_breadcrumb)
        while True:
            self.skip = not file.exists()
            sleep(0.3)

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
