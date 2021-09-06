import atexit
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop import Pitop
from pitop.common.logger import PTLogger

from .helpers import get_image_file_path
from .menus import (
    ApMenuPage,
    CarryOnMenuPage,
    Menus,
    OpenBrowserPage,
    RenderState,
    WelcomeMenuPage,
)


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.page_order = [Menus.WELCOME, Menus.AP, Menus.BROWSER, Menus.CARRY_ON]
        self.pages = {
            Menus.WELCOME: WelcomeMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.AP: ApMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.BROWSER: OpenBrowserPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.CARRY_ON: CarryOnMenuPage(self.miniscreen.size, self.miniscreen.mode),
        }

        self.current_page = self.pages.get(Menus.WELCOME)
        self.next_page = None

        self.miniscreen.up_button.when_pressed = lambda: self.go_to(
            self.get_previous_page(self.current_page)
        )
        self.miniscreen.down_button.when_pressed = lambda: self.go_to(
            self.get_next_page(self.current_page)
        )

        self.__auto_play_thread = None
        self.__stop_thread = False
        atexit.register(self.stop)

    def get_previous_page(self, page):
        curr_idx = self.page_order.index(page.type)
        prev_idx = len(self.page_order) - 1 if curr_idx - 1 < 0 else curr_idx - 1

        candidate = self.page_order[prev_idx]
        if self.pages.get(candidate).skip:
            return self.get_previous_page(self.pages.get(candidate))
        return candidate

    def get_next_page(self, page):
        curr_idx = self.page_order.index(page.type)
        next_idx = 0 if curr_idx + 1 == len(self.page_order) else curr_idx + 1

        candidate = self.page_order[next_idx]
        if self.pages.get(candidate).skip:
            return self.get_next_page(self.pages.get(candidate))
        return candidate

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

                # Transitions
                if (
                    self.current_page == self.pages.get(Menus.AP)
                    and self.pages.get(Menus.AP).render_state
                    == RenderState.DISPLAYING_INFO
                    and self.pages.get(Menus.BROWSER).should_display()
                ):
                    self.go_to(Menus.BROWSER)
                elif (
                    self.current_page == self.pages.get(Menus.BROWSER)
                    and self.pages.get(Menus.BROWSER).render_state
                    == RenderState.DISPLAYING_INFO
                    and self.pages.get(Menus.CARRY_ON).should_display()
                ):
                    self.go_to(Menus.CARRY_ON)

        except KeyboardInterrupt:
            pass
        finally:
            self.miniscreen.stop_animated_image()
