import atexit
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop import Pitop
from pitop.common.logger import PTLogger

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
        self.page_to_move_to = None

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
        # Don't go to bottom page
        prev_idx = 0 if curr_idx - 1 < 0 else curr_idx - 1

        candidate = self.page_order[prev_idx]
        if self.pages.get(candidate).skip:
            return self.get_previous_page(self.pages.get(candidate))
        return candidate

    def get_next_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Don't go to top page
        next_idx = curr_idx if curr_idx + 1 == len(self.page_order) else curr_idx + 1

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
        self.page_to_move_to = self.pages.get(page)
        PTLogger.info(f"Moving to {self.page_to_move_to.type.name} page")

    def _main(self):
        empty_image = Image.new(self.miniscreen.mode, self.miniscreen.size)

        while self.__stop_thread is False:
            image = empty_image.copy()
            draw = ImageDraw.Draw(image)

            # Update page
            force_redraw = self.page_to_move_to is not None
            if self.page_to_move_to:
                self.current_page = self.page_to_move_to
                self.page_to_move_to = None
                self.current_page.first_draw = True

            # Draw current page to image
            self.current_page.render(draw, redraw=force_redraw)

            # Display image
            self.miniscreen.device.display(image)

            # Wait
            sleep(self.current_page.interval)

            # Transitions
            def showing_info_on_current_page():
                return (
                    self.pages.get(self.current_page).render_state
                    == RenderState.DISPLAYING_INFO
                )

            def current_page_should_go_to_next_page():
                if self.current_page != Menus.AP and self.current_page != Menus.BROWSER:
                    return False

                return (
                    showing_info_on_current_page(self.current_page)
                    and self.get_next_page(self.current_page).should_display()
                )

            if current_page_should_go_to_next_page():
                self.go_to(self.get_next_page(self.current_page))
