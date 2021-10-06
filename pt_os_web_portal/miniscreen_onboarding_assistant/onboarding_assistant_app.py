from enum import Enum
from threading import Thread

from pitop import Pitop
from pitop.common.logger import PTLogger

from .page_manager import PageManager


class Speeds(Enum):
    DYNAMIC_PAGE_REDRAW = 1
    SCROLL = 0.004
    SKIP = 0.001


class OnboardingAssistantApp:
    def __init__(self):
        self.__thread = Thread(target=self._main, args=())
        self.__stop = False
        self.miniscreen = Pitop().miniscreen
        self.manager = PageManager(
            self.miniscreen,
            page_redraw_speed=Speeds.DYNAMIC_PAGE_REDRAW.value,
            scroll_speed=Speeds.SCROLL.value,
            skip_speed=Speeds.SKIP.value,
        )

    def start(self):
        self.__thread = Thread(target=self._main, args=())
        self.__thread.daemon = True
        self.__thread.start()

    def stop(self):
        self.__stop = True
        if self.__thread and self.__thread.is_alive():
            self.__thread.join()
        PTLogger.info("Stopped: miniscreen onboarding assistant")

    def _main(self):
        while not self.__stop:
            self.manager.update_scroll_position()
            self.manager.display_current_viewport_image()
            self.manager.wait_until_timeout_or_page_has_changed()
