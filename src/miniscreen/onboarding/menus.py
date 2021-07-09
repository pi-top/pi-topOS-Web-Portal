from copy import copy
from enum import IntEnum, Enum
from os import path
from PIL import ImageDraw, Image

from .connection_methods import (
    ApConnection,
    UsbConnection,
    EthernetConnection,
)
from .helpers import (
    FIRST_LINE_Y,
    MARGIN_X,
    SECOND_LINE_Y,
    THIRD_LINE_Y,
    draw_text,
    play_animated_image_file,
)
# Tunings to approximately match other sys info pages using GIFs
ANIMATION_SPEED = 1
ANIMATION_SLEEP_INTERVAL = 0.005
STATIONARY_SLEEP_INTERVAL = 0.5
FIRST_DRAW_SLEEP_INTERVAL = 1
DEFAULT_INTERVAL = 0.2


class Menus(IntEnum):
    AP = 0
    USB = 1
    ETHERNET = 2
    INFO = 3

    def next(self):
        next_mode = self.value + 1 if self.value + 1 < len(Menus) else 0
        return Menus(next_mode)

    def previous(self):
        previous = self.value - 1 if self.value - 1 >= 0 else len(Menus) - 1
        return Menus(previous)


class RenderState(Enum):
    STATIONARY = 0
    ANIMATING = 1
    DISPLAYING_INFO = 2


class MenuPageBase:
    def __init__(self, type, connection_state=None, path_to_image="", size=(0, 0), mode=0):
        self.type = type
        self.connection_state = connection_state
        self.path_to_image = path_to_image
        self.size = size
        self.mode = mode
        self.interval = STATIONARY_SLEEP_INTERVAL
        self.render_state = RenderState.STATIONARY

    def display_connection_data(self, miniscreen):
        pass

    def play_state_animation(self, miniscreen):
        if self.connection_state.is_connected():
            # final image shouldn't be cleared after animation finishes
            play_animated_image_file(miniscreen, self.path_to_image)
        else:
            image = Image.open(self.path_to_image)
            image = image.convert("1")
            canvas = ImageDraw.Draw(image)
            canvas.ellipse((70, 23) + (84, 37), fill=0, outline=0)
            canvas.ellipse((71, 24) + (83, 36), fill=1, outline=0)
            canvas.line((74, 27) + (79, 32), fill=0, width=2)
            canvas.line((75, 32) + (80, 27), fill=0, width=2)
            miniscreen.display_image(image)

    def render(self, miniscreen, force=False):
        state = self.connection_state
        self.play_state_animation(miniscreen)
        if state.is_connected():
            self.display_connection_data(miniscreen)

    def should_redraw(self):
        state = self.connection_state
        previous_state = copy(self.connection_state)
        state.update()
        return state != previous_state

    def get_image_file_path(self, relative_file_name):
        return path.abspath(
            path.join(
                path.dirname(
                    path.abspath(__file__)
                ),
                "images",
                relative_file_name
            )
        )

    def process_image(self, image_to_process):
        if image_to_process.size == self.size:
            image = image_to_process
            if image.mode != self.mode:
                image = image.convert(self.mode)
        else:
            image = Image.new(
                self.mode,
                self.size,
                "black"
            )
            image.paste(
                image_to_process.resize(
                    self.size,
                    resample=Image.NEAREST
                )
            )

        return image

    def add_disconnected_icon(self, pil_image):
        canvas = ImageDraw.Draw(pil_image)
        canvas.ellipse((70, 23) + (84, 37), fill=0, outline=0)
        canvas.ellipse((71, 24) + (83, 36), fill=1, outline=0)
        canvas.line((74, 27) + (79, 32), fill=0, width=2)
        canvas.line((75, 32) + (80, 27), fill=0, width=2)


class ApMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(ApMenuPage, self).__init__(Menus.AP, ApConnection(), "", size, mode)
        title_image_path = self.get_image_file_path("ap_title.png")
        info_image_path = self.get_image_file_path("ap_info.png")

        self.title_connected_image = self.process_image(
            Image.open(title_image_path)
        )
        self.title_disconnected_image = self.title_connected_image.copy()
        self.add_disconnected_icon(self.title_disconnected_image)

        self.info_image = self.process_image(
            Image.open(info_image_path)
        )

        self.title_image_pos = (0, 0)
        self.first_draw = True
        self.is_connected = False

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

    def render(self, miniscreen, force=False):
        image = Image.new(miniscreen.mode, miniscreen.size)
        draw = ImageDraw.Draw(image)

        if self.render_state != RenderState.ANIMATING:
            self.is_connected = self.connection_state.is_connected()
            if not self.is_connected:
                self.reset_animation()

        if self.render_state == RenderState.DISPLAYING_INFO:
            self.connection_state.update()

        if not self.first_draw:
            if self.is_connected:

                if self.title_image_pos[0] <= -self.size[0]:
                    self.render_state = RenderState.DISPLAYING_INFO
                elif self.render_state != RenderState.DISPLAYING_INFO:
                    self.render_state = RenderState.ANIMATING
                    self.title_image_pos = (self.title_image_pos[0] - ANIMATION_SPEED, 0)
            elif self.render_state != RenderState.STATIONARY:
                self.reset_animation()

        if self.render_state == RenderState.DISPLAYING_INFO:
            draw.bitmap(
                xy=(0, 0),
                bitmap=self.info_image,
                fill="white",
            )
            draw_text(draw, text=self.connection_state.metadata.get("ssid", ""), xy=(MARGIN_X, FIRST_LINE_Y))
            draw_text(draw, text=self.connection_state.metadata.get("passphrase", ""), xy=(MARGIN_X, SECOND_LINE_Y))
            draw_text(draw, text=self.connection_state.ip, xy=(MARGIN_X, THIRD_LINE_Y))
        else:
            title_image = self.title_connected_image if self.is_connected else self.title_disconnected_image
            draw.bitmap(
                xy=self.title_image_pos,
                bitmap=title_image,
                fill="white",
            )

        self.set_interval()
        self.first_draw = False

        miniscreen.device.display(image)


class UsbMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(UsbMenuPage, self).__init__(Menus.USB, UsbConnection(), self.get_image_file_path("usb.gif"), size, mode)

    def display_connection_data(self, miniscreen):
        image = miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text=str(self.connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
        miniscreen.display_image(image)


class EthernetMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(EthernetMenuPage, self).__init__(Menus.ETHERNET, EthernetConnection(), self.get_image_file_path("lan.gif"), size, mode)

    def display_connection_data(self, miniscreen):
        image = miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text=str(self.connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
        miniscreen.display_image(image)


class InfoMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(InfoMenuPage, self).__init__(Menus.INFO, size, mode)

    def render(self, miniscreen, force=False):
        build_data = self.build_data()
        image = Image.new(miniscreen.mode, miniscreen.size)
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text="pi-topOS", xy=(MARGIN_X/2, FIRST_LINE_Y))
        draw_text(canvas, text=f"Build: {build_data.get('build_number')}", xy=(MARGIN_X/2, SECOND_LINE_Y))
        draw_text(canvas, text=f"Date: {build_data.get('build_date')}", xy=(MARGIN_X/2, THIRD_LINE_Y))
        miniscreen.display_image(image)

    def should_redraw(self):
        return False

    def __get_file_lines(self, filename):
        lines = list()
        try:
            with open(filename) as fp:
                lines = fp.readlines()
        except Exception:
            pass
        return lines

    def build_data(self):
        headers = ("Build Number", "Build Date")
        data = {}
        for line in self.__get_file_lines("/etc/pt-issue"):
            try:
                title, value = line.strip().split(": ")
                if title in headers:
                    data[title.replace(" ", "_").lower()] = value
            except Exception:
                continue
        return data
