import atexit
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop import Pitop
from pitop.common.logger import PTLogger

from ..event import subscribe
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

        def handle_ready_to_be_a_maker_event(ready):
            PTLogger.info("READY TO BE A MAKER, BABY")
            # Enable carry on page
            self.pages.get(Menus.CARRY_ON).visible = True

        subscribe("ready_to_be_a_maker", handle_ready_to_be_a_maker_event)

    def get_previous_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Return current page if at top
        current_page = self.pages.get(self.page_order[curr_idx])
        if curr_idx - 1 < 0:
            return current_page

        candidate = self.pages.get(self.page_order[curr_idx - 1])
        return candidate if candidate.visible else current_page

    def get_next_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Return current page if at end
        current_page = self.pages.get(self.page_order[curr_idx])
        if curr_idx + 1 >= len(self.page_order):
            return current_page

        candidate = self.pages.get(self.page_order[curr_idx + 1])
        return candidate if candidate.visible else current_page

    def start(self):
        PTLogger.info("Miniscreen onboarding: Starting...")

        self.__auto_play_thread = Thread(target=self._main, args=())
        self.__auto_play_thread.daemon = True
        self.__auto_play_thread.start()

    def stop(self):
        PTLogger.info("Miniscreen onboarding: Stopping...")

        self.__stop_thread = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def go_to(self, page):
        if self.current_page == page:
            PTLogger.debug(
                f"Miniscreen onboarding: Already on page '{self.current_page.type.name}' - nothing to do"
            )
            return
        self.current_page = page
        self.current_page.first_draw = True
        PTLogger.info(
            f"Miniscreen onboarding: Set page to {self.current_page.type.name}"
        )

    def _main(self):
        empty_image = Image.new(self.miniscreen.mode, self.miniscreen.size)

        while self.__stop_thread is False:
            image = empty_image.copy()
            draw = ImageDraw.Draw(image)

            def showing_info_on_current_page():
                return self.current_page.render_state == RenderState.DISPLAYING_INFO

            def current_page_should_go_to_next_page():
                if self.current_page not in [Menus.AP, Menus.BROWSER]:
                    return False

                return (
                    showing_info_on_current_page(self.current_page)
                    and not self.get_next_page(self.current_page).visible
                    and self.get_next_page(self.current_page).first_draw is False
                )

            PTLogger.debug(
                "Miniscreen onboarding: Main loop - Handling automatic page change..."
            )
            if current_page_should_go_to_next_page():
                self.go_to(self.get_next_page(self.current_page))

            PTLogger.debug(
                "Miniscreen onboarding: Main loop - Drawing current page to image..."
            )
            self.current_page.render(draw, redraw=self.current_page.first_draw)

            PTLogger.debug("Miniscreen onboarding: Main loop - Displaying image...")
            self.miniscreen.device.display(image)

            PTLogger.debug("Miniscreen onboarding: Main loop - Sleeping...")
            interval_resolution = 0.005
            sleep_time = 0
            # Stop sleeping if the page has changed
            while (
                not self.current_page.first_draw
                and sleep_time < self.current_page.interval
            ):
                sleep(interval_resolution)
                sleep_time = sleep_time + interval_resolution
