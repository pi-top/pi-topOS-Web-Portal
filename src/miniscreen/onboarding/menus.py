from copy import copy
from enum import IntEnum
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


class MenuPageBase:
    def __init__(self, type, connection_state=None):
        self.type = type
        self.connection_state = connection_state

    def display_connection_data(self, miniscreen):
        pass

    def play_state_animation(self, miniscreen):
        if self.connection_state.is_connected():
            # final image shouldn't be cleared after animation finishes
            play_animated_image_file(miniscreen, self.connection_state.path_to_image)
        else:
            image = Image.open(self.connection_state.path_to_image)
            image = image.convert("1")
            canvas = ImageDraw.Draw(image)
            canvas.ellipse((70, 23) + (84, 37), fill=0, outline=0)
            canvas.ellipse((71, 24) + (83, 36), fill=1, outline=0)
            canvas.line((74, 27) + (79, 32), fill=0, width=2)
            canvas.line((75, 32) + (80, 27), fill=0, width=2)
            miniscreen.display_image(image)

    def render(self, miniscreen):
        state = self.connection_state
        self.play_state_animation(miniscreen)
        if state.is_connected():
            self.display_connection_data(miniscreen)

    def should_redraw(self):
        state = self.connection_state
        previous_state = copy(self.connection_state)
        state.update()
        return state != previous_state


class ApMenuPage(MenuPageBase):
    def __init__(self):
        super(ApMenuPage, self).__init__(Menus.AP, ApConnection())

    def display_connection_data(self, miniscreen):
        image = miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text=str(self.connection_state.metadata.get("ssid", "")), xy=(MARGIN_X, FIRST_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.metadata.get("passphrase", "")), xy=(MARGIN_X, SECOND_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
        miniscreen.display_image(image)


class UsbMenuPage(MenuPageBase):
    def __init__(self):
        super(UsbMenuPage, self).__init__(Menus.USB, UsbConnection())

    def display_connection_data(self, miniscreen):
        image = miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text=str(self.connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
        miniscreen.display_image(image)


class EthernetMenuPage(MenuPageBase):
    def __init__(self):
        super(EthernetMenuPage, self).__init__(Menus.ETHERNET, EthernetConnection())

    def display_connection_data(self, miniscreen):
        image = miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        draw_text(canvas, text=str(self.connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y))
        draw_text(canvas, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
        miniscreen.display_image(image)


class InfoMenuPage(MenuPageBase):
    def __init__(self):
        super(InfoMenuPage, self).__init__(Menus.INFO)

    def render(self, miniscreen):
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
