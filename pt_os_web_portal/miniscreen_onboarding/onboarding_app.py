import atexit
from threading import Thread
from time import sleep

from pitop import Pitop
from pitop.common.logger import PTLogger

from .page_manager import PageManager

ANIMATION_SLEEP_INTERVAL = 0.02
DEFAULT_INTERVAL = 1


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen

        self.page_mgr = PageManager(self.miniscreen, DEFAULT_INTERVAL)

        self.__thread = Thread(target=self._main, args=())
        self.__stop = False
        atexit.register(self.stop)

    def start(self):
        PTLogger.info("Miniscreen onboarding: Starting...")

        self.__thread = Thread(target=self._main, args=())
        self.__thread.daemon = True
        self.__thread.start()

    def stop(self):
        PTLogger.info("Miniscreen onboarding: Stopping...")

        self.__stop = True
        if self.__thread and self.__thread.is_alive():
            self.__thread.join()

    def _main(self):
        def scroll_to_current_page():
            PTLogger.info(
                f"Miniscreen onboarding: Scrolling to page {self.page_mgr.current_page.type}"
            )

            y_pos = self.page_mgr.current_page_index * self.miniscreen.size[1]

            viewport = self.page_mgr.viewport
            if y_pos == viewport._position[1]:
                return

            direction_scalar = 1 if y_pos - viewport._position[1] > 0 else -1
            pixels_to_jump_per_frame = 2
            while y_pos != viewport._position[1]:
                viewport.set_position(
                    (
                        0,
                        viewport._position[1]
                        + (direction_scalar * pixels_to_jump_per_frame),
                    )
                )
                sleep(ANIMATION_SLEEP_INTERVAL)

        while not self.__stop:
            self.page_mgr.handle_automatic_transitions()
            if not self.page_mgr.viewport_position_is_correct():
                scroll_to_current_page()
            self.page_mgr.refresh()
            sleep(0.1)

            self.page_mgr.wait_until_timeout_or_page_has_changed()
