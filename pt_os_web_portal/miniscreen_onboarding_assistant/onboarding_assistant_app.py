import atexit
from threading import Thread
from time import sleep

from pitop import Pitop
from pitop.common.logger import PTLogger

from .page_manager import PageManager

ANIMATION_SLEEP_INTERVAL = 0.013
DEFAULT_INTERVAL = 1
FPS = 10


class OnboardingAssistantApp:
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
        while not self.__stop:
            if not self.page_mgr.viewport_position_is_correct():
                self.page_mgr.scroll_to_current_page(ANIMATION_SLEEP_INTERVAL)

            self.page_mgr.refresh()
            sleep(1 / FPS)

            self.page_mgr.wait_until_timeout_or_page_has_changed()
