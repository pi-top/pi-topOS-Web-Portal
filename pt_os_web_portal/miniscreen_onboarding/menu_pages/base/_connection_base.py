from PIL import Image, ImageDraw

from .attr.speeds import (
    ANIMATION_SLEEP_INTERVAL,
    ANIMATION_SPEED,
    DEFAULT_INTERVAL,
    FIRST_DRAW_SLEEP_INTERVAL,
    STATIONARY_SLEEP_INTERVAL,
)
from .attr.states import RenderState
from .base._base import MenuPageBase
from .render.helpers import get_image_file_path, process_image


class ConnectionMenuPage(MenuPageBase):
    def __init__(
        self,
        type,
        connection_state=None,
        title_image_filename="",
        info_image_filename="",
        size=(0, 0),
        mode=0,
    ):
        super(ConnectionMenuPage, self).__init__(type, size, mode)

        self.connection_state = connection_state
        self.interval = STATIONARY_SLEEP_INTERVAL
        self.render_state = RenderState.STATIONARY

        self.title_connected_image = process_image(
            Image.open(get_image_file_path(title_image_filename)), size, mode
        )
        self.title_disconnected_image = self.title_connected_image.copy()

        def add_disconnected_icon(pil_image):
            canvas = ImageDraw.Draw(pil_image)
            canvas.ellipse((70, 23) + (84, 37), fill=0, outline=0)
            canvas.ellipse((71, 24) + (83, 36), fill=1, outline=0)
            canvas.line((74, 27) + (79, 32), fill=0, width=2)
            canvas.line((75, 32) + (80, 27), fill=0, width=2)

        add_disconnected_icon(self.title_disconnected_image)

        self.info_image = process_image(
            Image.open(get_image_file_path(info_image_filename)), size, mode
        )

        self.title_image_pos = (0, 0)
        self.first_draw = True
        self.is_connected = False

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

    def render(self, draw, redraw=False):
        if redraw or self.render_state != RenderState.ANIMATING:
            self.connection_state.update()
            self.is_connected = self.connection_state.is_connected()
            if redraw or not self.is_connected:
                self.reset_animation()

        if not self.first_draw:
            if self.is_connected:
                if self.title_image_pos[0] <= -self.size[0]:
                    self.render_state = RenderState.DISPLAYING_INFO
                elif self.render_state != RenderState.DISPLAYING_INFO:
                    self.render_state = RenderState.ANIMATING
                    self.title_image_pos = (
                        self.title_image_pos[0] - ANIMATION_SPEED,
                        0,
                    )
            elif self.render_state != RenderState.STATIONARY:
                self.reset_animation()

        if self.render_state == RenderState.DISPLAYING_INFO:
            draw.bitmap(
                xy=(0, 0),
                bitmap=self.info_image,
                fill="white",
            )
            self.draw_connection_data(draw)
        else:
            title_image = (
                self.title_connected_image
                if self.is_connected
                else self.title_disconnected_image
            )
            draw.bitmap(
                xy=self.title_image_pos,
                bitmap=title_image,
                fill="white",
            )

        self.set_interval()
        self.first_draw = False
