import atexit
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop import Pitop
from pitop.common.logger import PTLogger

from .helpers import get_image_file_path
from .menus import ApMenuPage, EthernetMenuPage, InfoMenuPage, Menus, UsbMenuPage


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.miniscreen.up_button.when_pressed = lambda: self.go_to(
            self.current_page.type.previous()
        )
        self.miniscreen.down_button.when_pressed = lambda: self.go_to(
            self.current_page.type.next()
        )
        self.pages = {
            Menus.AP: ApMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.USB: UsbMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.ETHERNET: EthernetMenuPage(
                self.miniscreen.size, self.miniscreen.mode
            ),
            Menus.INFO: InfoMenuPage(self.miniscreen.size, self.miniscreen.mode),
        }

        self.current_page = self.pages.get(Menus.AP)
        self.next_page = None

        self.__auto_play_thread = None
        self.__stop_thread = False
        atexit.register(self.stop)

    def start(self):
        self.__auto_play_thread = Thread(target=self._main, args=())
        self.__auto_play_thread.daemon = True
        self.__auto_play_thread.start()

    def stop(self):
        self.__stop_thread = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def go_to(self, page):
        self.next_page = self.pages.get(page)
        PTLogger.info(f"Moving to {self.next_page.type.name} page")

    def _main(self):
        try:
            # Play startup animation
            self.miniscreen.play_animated_image_file(
                get_image_file_path("pi-top_startup.gif"), background=False, loop=False
            )

            # Do main app
            empty_image = Image.new(self.miniscreen.mode, self.miniscreen.size)
            force_redraw = False
            while self.__stop_thread is False:
                image = empty_image.copy()
                draw = ImageDraw.Draw(image)

                self.current_page.render(draw, redraw=force_redraw)
                force_redraw = False

                if self.next_page:
                    self.current_page = self.next_page
                    self.next_page = None
                    force_redraw = True
                    self.current_page.first_draw = True

                self.miniscreen.device.display(image)
                sleep(self.current_page.interval)
        except KeyboardInterrupt:
            pass
        finally:
            self.miniscreen.stop_animated_image()
