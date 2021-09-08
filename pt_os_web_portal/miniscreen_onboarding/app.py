import atexit
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop import Pitop
from pitop.common.logger import PTLogger

from .menu_pages import (
    ApMenuPage,
    CarryOnMenuPage,
    OpenBrowserMenuPage,
    WelcomeMenuPage,
)
from .menu_pages.attr.states import RenderState
from .menus import Menus


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.page_order = [Menus.WELCOME, Menus.AP, Menus.BROWSER, Menus.CARRY_ON]
        self.pages = {
            Menus.WELCOME: WelcomeMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.AP: ApMenuPage(self.miniscreen.size, self.miniscreen.mode),
            Menus.BROWSER: OpenBrowserMenuPage(
                self.miniscreen.size, self.miniscreen.mode
            ),
            Menus.CARRY_ON: CarryOnMenuPage(self.miniscreen.size, self.miniscreen.mode),
        }

        self.current_page = self.pages.get(Menus.WELCOME)

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
        # Return current page if at end
        if curr_idx - 1 <= 0:
            return self.pages.get(self.page_order[curr_idx])

        candidate = self.pages.get(self.page_order[curr_idx - 1])
        if candidate.skip:
            return self.get_next_page(candidate)
        return candidate

    def get_next_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Return current page if at end
        if curr_idx + 1 >= len(self.page_order):
            return self.pages.get(self.page_order[curr_idx])

        candidate = self.pages.get(self.page_order[curr_idx + 1])
        if candidate.skip:
            return self.get_next_page(candidate)
        return candidate

    def start(self):
        PTLogger.info("Starting...")

        self.__auto_play_thread = Thread(target=self._main, args=())
        self.__auto_play_thread.daemon = True
        self.__auto_play_thread.start()

    def stop(self):
        PTLogger.info("Stopping...")

        self.__stop_thread = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def go_to(self, page):
        if self.current_page == page:
            PTLogger.debug(
                f"Already on page '{self.current_page.type.name}' - nothing to do"
            )
            return
        self.current_page = page
        self.current_page.first_draw = True
        PTLogger.info(f"Set page to {self.current_page.type.name}")

    def _main(self):
        empty_image = Image.new(self.miniscreen.mode, self.miniscreen.size)

        while self.__stop_thread is False:
            image = empty_image.copy()
            draw = ImageDraw.Draw(image)

            def showing_info_on_current_page():
                return (
                    self.pages.get(self.current_page).render_state
                    == RenderState.DISPLAYING_INFO
                )

            def current_page_should_go_to_next_page():
                if self.current_page not in [Menus.AP, Menus.BROWSER]:
                    return False

                return (
                    showing_info_on_current_page(self.current_page)
                    and self.get_next_page(self.current_page).should_display()
                )

            PTLogger.debug("Main loop: Handling automatic page change...")
            if current_page_should_go_to_next_page():
                self.go_to(self.get_next_page(self.current_page))

            PTLogger.debug("Main loop: Drawing current page to image...")
            self.current_page.render(draw, redraw=self.current_page.first_draw)

            PTLogger.debug("Main loop: Displaying image...")
            self.miniscreen.device.display(image)

            PTLogger.debug("Main loop: Sleeping...")
            interval_resolution = 0.005
            sleep_time = 0
            # Stop sleeping if the page has changed
            while (
                not self.current_page.first_draw
                and sleep_time < self.current_page.interval
            ):
                sleep(interval_resolution)
                sleep_time = sleep_time + interval_resolution
