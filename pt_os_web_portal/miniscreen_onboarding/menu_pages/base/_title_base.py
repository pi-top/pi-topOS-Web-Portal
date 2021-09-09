from PIL import Image

from ..attr.speeds import (
    ANIMATION_SLEEP_INTERVAL,
    ANIMATION_SPEED,
    DEFAULT_INTERVAL,
    FIRST_DRAW_SLEEP_INTERVAL,
    STATIONARY_SLEEP_INTERVAL,
)
from ..attr.states import RenderState
from ..render.helpers import get_image_file_path, process_image
from ._base import MenuPageBase


class TitleMenuPage(MenuPageBase):
    def __init__(
        self,
        type,
        title_image_filename="",
        size=(0, 0),
        mode=0,
    ):
        super(TitleMenuPage, self).__init__(type, size, mode)

        self.interval = STATIONARY_SLEEP_INTERVAL
        self.render_state = RenderState.STATIONARY

        self.title_image = process_image(
            Image.open(get_image_file_path(title_image_filename)), size, mode
        )

        self.title_image_pos = (0, 0)
        self.first_draw = True

    def draw_connection_data(self, draw):
        raise NotImplementedError

    def reset_animation(self):
        self.title_image_pos = (0, 0)
        self.render_state = RenderState.STATIONARY
        self.first_draw = True

    def set_interval(self):
        if self.first_draw:
            self.interval = FIRST_DRAW_SLEEP_INTERVAL
        elif self.render_state == RenderState.STATIONARY:
            self.interval = STATIONARY_SLEEP_INTERVAL
        elif self.render_state == RenderState.ANIMATING:
            self.interval = ANIMATION_SLEEP_INTERVAL
        else:
            self.interval = DEFAULT_INTERVAL

    def info(self, draw, redraw=False):
        raise NotImplementedError

    def render(self, draw, redraw=False):
        if redraw:
            self.reset_animation()

        if not self.first_draw:
            if self.title_image_pos[0] <= -self.size[0]:
                self.render_state = RenderState.DISPLAYING_INFO
            elif self.render_state != RenderState.DISPLAYING_INFO:
                self.render_state = RenderState.ANIMATING
                self.title_image_pos = (
                    self.title_image_pos[0] - ANIMATION_SPEED,
                    0,
                )

        if self.render_state == RenderState.DISPLAYING_INFO:
            self.info(draw)
        else:
            draw.bitmap(
                xy=self.title_image_pos,
                bitmap=self.title_image,
                fill="white",
            )

        self.set_interval()
        self.first_draw = False
