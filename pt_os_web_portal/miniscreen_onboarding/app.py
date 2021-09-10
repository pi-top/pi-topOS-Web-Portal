import atexit
from threading import Thread
from time import sleep

from pitop import Pitop
from pitop.common.logger import PTLogger

from .page_manager import PageManager


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen

        self.page_mgr = PageManager(self.miniscreen)

        self.miniscreen.up_button.when_pressed = self.page_mgr.go_to_previous_page
        self.miniscreen.down_button.when_pressed = self.page_mgr.go_to_next_page

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
            self.page_mgr.handle_automatic_transitions()
            self.page_mgr.refresh()
            sleep(0.1)
