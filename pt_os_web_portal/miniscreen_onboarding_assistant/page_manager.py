from threading import Event
from time import sleep

from pitop.common.logger import PTLogger
from pitop.miniscreen.oled.core.contrib.luma.core.virtual import viewport

from .. import state
from ..event import AppEvents, subscribe
from .pages import Page, PageGenerator


class PageManager:
    def __init__(self, miniscreen, default_page_interval=1):
        self._miniscreen = miniscreen

        self._miniscreen.up_button.when_released = (
            self.set_current_page_to_previous_page
        )
        self._miniscreen.down_button.when_released = self.set_current_page_to_next_page
        self._miniscreen.cancel_button.when_released = (
            self.set_current_page_to_previous_page
        )
        self._miniscreen.select_button.when_released = (
            self.set_current_page_to_next_page
        )

        self.current_page_index = int(
            state.get("miniscreen_onboarding", "state", fallback=0)
        )

        def automatic_transition_to_last_page(_):
            last_page_index = len(self.pages) - 1
            # Only do automatic update if on previous page
            if self.current_page_index == last_page_index - 1:
                self.set_current_page_to(self.get_page(last_page_index))

        subscribe(AppEvents.READY_TO_BE_A_MAKER, automatic_transition_to_last_page)

        size = miniscreen.size
        width = size[0]
        height = size[1]

        mode = miniscreen.mode

        self.viewport = viewport(
            miniscreen.device,
            width=width,
            height=height * len(Page),
        )
        self.viewport.set_position((0, self.current_page_index * height))

        self.page_has_changed = Event()

        def page_instance(page_type):
            return PageGenerator.get_page(page_type)(size, mode, default_page_interval)

        self.pages = [page_instance(page_type) for page_type in Page]

        for i, page in enumerate(self.pages):
            self.viewport.add_hotspot(page, (0, i * height))

        def save_miniscreen_onboarding_app_event(restarting_web_portal):
            if restarting_web_portal:
                state.set(
                    "miniscreen_onboarding", "state", str(self.current_page_index)
                )

        subscribe(AppEvents.RESTARTING_WEB_PORTAL, save_miniscreen_onboarding_app_event)

    def get_page(self, index):
        return self.pages[index]

    @property
    def current_page(self):
        return self.get_page(self.current_page_index)

    def viewport_position_is_correct(self):
        return (
            self.viewport._position[1]
            == self.current_page_index * self.current_page.height
        )

    def set_current_page_to(self, page):
        if not self.viewport_position_is_correct():
            return

        new_page = page.type
        new_page_index = new_page.value - 1
        if self.current_page_index == new_page_index:
            PTLogger.debug(
                f"Miniscreen onboarding: Already on page '{new_page.name}' - nothing to do"
            )
            return

        PTLogger.info(f"Page index: {self.current_page_index} -> {new_page_index}")
        self.current_page_index = new_page_index
        self.page_has_changed.set()

    def set_current_page_to_previous_page(self):
        self.set_current_page_to(self.get_previous_page())

    def set_current_page_to_next_page(self):
        self.set_current_page_to(self.get_next_page())

    def get_previous_page(self):
        # Return next page if at top
        if self.current_page_index == 0:
            return self.get_next_page()

        candidate = self.get_page(self.current_page_index - 1)
        return candidate if candidate.visible else self.current_page

    def get_next_page(self):
        # Return current page if at end
        if self.current_page_index + 1 >= len(Page):
            return self.current_page

        candidate = self.get_page(self.current_page_index + 1)
        return candidate if candidate.visible else self.current_page

    def refresh(self):
        self.viewport.refresh()

    def wait_until_timeout_or_page_has_changed(self):
        self.page_has_changed.wait(self.current_page.interval)
        if self.page_has_changed.is_set():
            self.page_has_changed.clear()

    def scroll_to_current_page(self, interval):
        PTLogger.info(
            f"Miniscreen onboarding: Scrolling to page {self.current_page.type}"
        )

        y_pos = self.current_page_index * self._miniscreen.size[1]

        if y_pos == self.viewport._position[1]:
            return

        direction_scalar = 1 if y_pos - self.viewport._position[1] > 0 else -1
        pixels_to_jump_per_frame = 2
        while y_pos != self.viewport._position[1]:
            self.viewport.set_position(
                (
                    0,
                    self.viewport._position[1]
                    + (direction_scalar * pixels_to_jump_per_frame),
                )
            )
            sleep(interval)
