import atexit
from threading import Thread

from PIL import Image
from pitop import Pitop
from pitop.common.logger import PTLogger

from .page_manager import PageManager


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen

        self.page_mgr = PageManager(
            size=self.miniscreen.size,
            mode=self.miniscreen.mode,
        )

        self.miniscreen.up_button.when_pressed = self.page_mgr.go_to_previous_page
        self.miniscreen.down_button.when_pressed = self.page_mgr.go_to_next_page

        self.__auto_play_thread = None
        self.__stop_thread = False
        atexit.register(self.stop)

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

    def _main(self):
        empty_image = Image.new(self.miniscreen.mode, self.miniscreen.size)

        while self.__stop_thread is False:
            image = empty_image.copy()

            self.page_mgr.handle_automatic_transitions()

            PTLogger.debug(
                "Miniscreen onboarding: Main loop - Drawing current page to image..."
            )
            self.page_mgr.render_current_page(image)

            PTLogger.debug("Miniscreen onboarding: Main loop - Displaying image...")
            self.miniscreen.device.display(image)

            PTLogger.debug("Miniscreen onboarding: Main loop - Sleeping...")
            self.page_mgr.wait_until_timeout_or_page_has_changed(
                self.page_mgr.current_page.interval
            )
