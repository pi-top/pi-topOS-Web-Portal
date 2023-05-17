import logging
import traceback

from pitop.system.pitop import Pitop
from pt_miniscreen.core import App as BaseApp

from .root import RootComponent

logger = logging.getLogger(__name__)


class OnboardingAssistantApp(BaseApp):
    miniscreen = None

    def __init__(self):
        self._configure_miniscreen()

        super().__init__(
            display=self.display_func,
            Root=RootComponent,
            size=self.miniscreen.size,
        )

    def _configure_miniscreen(self):
        self.miniscreen = Pitop().miniscreen
        self.miniscreen.select_button.when_released = self._create_button_handler(
            lambda: self.root.handle_select_button()
        )
        self.miniscreen.cancel_button.when_released = self._create_button_handler(
            lambda: self.root.switch_menu()
        )
        self.miniscreen.up_button.when_released = self._create_button_handler(
            lambda: self.root.scroll_up()
        )
        self.miniscreen.down_button.when_released = self._create_button_handler(
            lambda: self.root.scroll_down()
        )

    @property
    def display_func(self):
        return self.miniscreen.device.display

    def _create_button_handler(self, func):
        def handler():
            try:
                if callable(func):
                    func()
            except Exception as e:
                logger.error(f"Error in button handler: {e}")
                traceback.print_exc()
                self._configure_miniscreen()

        return handler

    @property
    def user_has_control(self):
        return hasattr(self.miniscreen, "is_active") and self.miniscreen.is_active
