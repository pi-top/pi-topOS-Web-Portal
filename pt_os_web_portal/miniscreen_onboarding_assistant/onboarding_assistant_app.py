import logging

from pitop.system.pitop import Pitop
from pt_miniscreen.core import App as BaseApp

from .root import RootComponent

logger = logging.getLogger(__name__)


class OnboardingAssistantApp(BaseApp):
    def __init__(self):
        self.user_has_control = False
        self.miniscreen = Pitop().miniscreen

        self.miniscreen.select_button.when_released = self.handle_select_button_release
        self.miniscreen.cancel_button.when_released = self.handle_cancel_button_release
        self.miniscreen.up_button.when_released = self.handle_up_button_release
        self.miniscreen.down_button.when_released = self.handle_down_button_release

        def set_is_user_controlled(user_has_control) -> None:
            self.user_has_control = user_has_control
            if not user_has_control:
                self._restore_miniscreen()

            logger.info(
                f"User has {'taken' if user_has_control else 'given back'} control of the miniscreen"
            )

        self.miniscreen.when_user_controlled = lambda: set_is_user_controlled(True)
        self.miniscreen.when_system_controlled = lambda: set_is_user_controlled(False)

        super().__init__(
            display=self.miniscreen.device.display,
            Root=RootComponent,
            size=self.miniscreen.size,
        )

    def handle_select_button_release(self):
        if not self.user_has_control:
            self.root.handle_select_button()

    def handle_cancel_button_release(self):
        if not self.user_has_control:
            self.root.switch_menu()

    def handle_up_button_release(self):
        if not self.user_has_control:
            self.root.scroll_up()

    def handle_down_button_release(self):
        if not self.user_has_control:
            self.root.scroll_down()

    def _restore_miniscreen(self):
        try:
            self.miniscreen.reset()
        except RuntimeError as e:
            logger.error(f"Error resetting miniscreen: {e}")

        self.display()
