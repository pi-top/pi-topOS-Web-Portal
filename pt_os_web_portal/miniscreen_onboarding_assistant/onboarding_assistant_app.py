import logging

from pitop.system.pitop import Pitop
from pt_miniscreen.core import App as BaseApp

from .root import RootComponent

logger = logging.getLogger(__name__)


class OnboardingAssistantApp(BaseApp):
    def __init__(self):
        miniscreen = Pitop().miniscreen

        miniscreen.select_button.when_released = self.handle_select_button_release
        miniscreen.cancel_button.when_released = self.handle_cancel_button_release
        miniscreen.up_button.when_released = self.handle_up_button_release
        miniscreen.down_button.when_released = self.handle_down_button_release

        super().__init__(miniscreen, Root=RootComponent)

    def handle_select_button_release(self):
        self.root.handle_select_button()

    def handle_cancel_button_release(self):
        self.root.switch_menu()

    def handle_up_button_release(self):
        self.root.scroll_up()

    def handle_down_button_release(self):
        self.root.scroll_down()

    @property
    def user_has_control(self) -> bool:
        return self.miniscreen.is_active
