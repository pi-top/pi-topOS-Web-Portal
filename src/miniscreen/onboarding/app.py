import atexit
from threading import Thread
from time import sleep

from pitop import Pitop

from .menus import (
    ApMenuPage,
    EthernetMenuPage,
    InfoMenuPage,
    Menus,
    UsbMenuPage,
)


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.miniscreen.up_button.when_pressed = lambda: self.go_to(self.current_page.type.next())
        self.miniscreen.down_button.when_pressed = lambda: self.go_to(self.current_page.type.previous())

        self.pages = {
            Menus.AP: ApMenuPage(),
            Menus.USB: UsbMenuPage(),
            Menus.ETHERNET: EthernetMenuPage(),
            Menus.INFO: InfoMenuPage(),
        }

        self.current_page = self.pages.get(Menus.AP)
        self.needs_redraw = False

        self.__auto_play_thread = None
        self.__stop_thread = False
        atexit.register(self.stop)

    def start(self):
        self.__auto_play_thread = Thread(target=self.__run_in_background, args=())
        self.__auto_play_thread.daemon = True
        self.__auto_play_thread.start()

    def stop(self):
        self.__stop_thread = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def update_display(self):
        self.current_page.render(self.miniscreen)

    def should_redraw(self):
        result = self.needs_redraw or self.current_page.should_redraw()
        self.needs_redraw = False
        return result

    def go_to(self, page):
        self.needs_redraw = True
        self.current_page = self.pages.get(page)
        print(f"going to {self.current_page.type.name}")

    def __run_in_background(self):
        try:
            self.update_display()
            while self.__stop_thread is False:
                if self.should_redraw():
                    self.miniscreen.reset()
                    self.update_display()
                sleep(0.5)
        except KeyboardInterrupt:
            pass
        finally:
            self.miniscreen.stop_animated_image()
