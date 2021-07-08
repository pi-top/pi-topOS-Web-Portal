import atexit
from PIL import ImageDraw
from multiprocessing import Process, Value
from ctypes import c_bool
from time import sleep

from pitop import Pitop

from .connection.methods import (
    ConnectionMethod,
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


from enum import IntEnum


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


class MenuPage:
    def __init__(self, type, connection_state):
        self.type = type
        self.connection_state = connection_state

    def render(self):
        previous_state = self.connection_state
        self.connection_state.update()
        if self.connection_state != previous_state:
            self.play_state_animation(self.connection_state)
            if self.connection_state.is_connected():
                self.display_connection_data(self.connection_state)


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.pages = {
            Menus.AP: MenuPage(Menus.AP, ApConnection()),
            Menus.USB: MenuPage(Menus.USB, UsbConnection()),
            Menus.ETHERNET: MenuPage(Menus.ETHERNET, EthernetConnection()),
            Menus.INFO: MenuPage(Menus.INFO, None),
        }
        self.current_page = self.pages.get(Menus.AP)
        self.__auto_play_thread = None
        self.__stop_thread = Value(c_bool, False)
        atexit.register(self.stop)

    def start(self):
        self.__auto_play_thread = Process(target=self.__run_in_background, args=())
        self.__auto_play_thread.daemon = True
        self.__auto_play_thread.start()

    def stop(self):
        self.__stop_thread.value = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def play_state_animation(self, connection_state):
        if connection_state.is_connected():
            # final image shouldn't be cleared after animation finishes
            play_animated_image_file(self.miniscreen, connection_state.path_to_image)
        else:
            self.miniscreen.play_animated_image_file(connection_state.path_to_image,
                                                     loop=True,
                                                     background=True)

    def display_connection_data(self, connection_state):
        image = self.miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        if connection_state.connection_method == ConnectionMethod.AP:
            draw_text(canvas, text=str(connection_state.metadata.get("ssid", "")), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection_state.metadata.get("passphrase", "")), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y),)
        elif connection_state.connection_method == ConnectionMethod.USB:
            draw_text(canvas, text=str(connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y),)
        elif connection_state.connection_method == ConnectionMethod.ETHERNET:
            draw_text(canvas, text=str(connection_state.metadata.get("username", "")), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection_state.metadata.get("password", "")), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y),)
        self.miniscreen.display_image(image)

    def __go_to(self, page):
        self.current_page = self.pages.get(page)

    def __run_in_background(self):
        self.miniscreen.up_button.when_pressed = lambda: self.__go_to(self.current_page.type.next())
        self.miniscreen.down_button.when_pressed = lambda: self.__go_to(self.current_page.type.previous())

        try:
            while self.__stop_thread.value is False:
                self.current_page.render()
                sleep(0.5)
        except KeyboardInterrupt:
            pass
        finally:
            self.miniscreen.stop_animated_image()


if __name__ == '__main__':
    from signal import pause
    try:
        app = OnboardingApp()
        app.start()
        pause()
    except KeyboardInterrupt:
        pass
    app.stop()
