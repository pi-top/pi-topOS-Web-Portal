import atexit
from threading import Thread
from time import sleep

from pitop import Pitop
from pitopcommon.logger import PTLogger

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
        self.miniscreen.up_button.when_pressed = lambda: self.go_to(self.current_page.type.previous())
        self.miniscreen.down_button.when_pressed = lambda: self.go_to(self.current_page.type.next())

        self.pages = {
            Menus.AP: ApMenuPage(),
            Menus.USB: UsbMenuPage(),
            Menus.ETHERNET: EthernetMenuPage(),
            Menus.INFO: InfoMenuPage(),
        }

        self.current_page = self.pages.get(Menus.AP)
        self.next_page = None
        self.force_redraw = False

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

    def should_redraw(self, page):
        return self.force_redraw or page.should_redraw()

    def go_to(self, page):
        self.next_page = self.pages.get(page)
        PTLogger.info(f"Moving to {self.next_page.type.name} page")

    def __run_in_background(self):
        try:
            self.current_page.render(self.miniscreen)
            while self.__stop_thread is False:
                current_page = self.current_page
                if self.should_redraw(current_page):
                    PTLogger.info(f"Redrawing {current_page.type.name}")
                    self.miniscreen.reset()
                    current_page.render(self.miniscreen)
                    self.force_redraw = False

                if self.next_page:
                    self.current_page = self.next_page
                    self.next_page = None
                    self.force_redraw = True

                sleep(0.2)
        except KeyboardInterrupt:
            pass
        finally:
            self.miniscreen.stop_animated_image()
