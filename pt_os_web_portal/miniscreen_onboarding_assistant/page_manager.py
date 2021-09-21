from threading import Event
from time import sleep

from pitop.common.logger import PTLogger

from ..event import AppEvents, subscribe
from .pages.guide import GuidePage, GuidePageGenerator
from .pages.menu import MenuPage, MenuPageGenerator
from .viewport import Viewport

scroll_px_resolution = 2


class PageManager:
    def __init__(self, miniscreen, page_redraw_speed, scroll_speed):
        self._ms = miniscreen

        self.page_redraw_speed = page_redraw_speed
        self.scroll_speed = scroll_speed

        self._ms.up_button.when_released = self.set_page_to_previous_page
        self._ms.down_button.when_released = self.set_page_to_next_page
        self._ms.select_button.when_released = self.set_page_to_next_page
        self._ms.cancel_button.when_released = self.handle_cancel_btn

        self.guide_viewport = Viewport(
            "guide",
            miniscreen,
            [
                GuidePageGenerator.get_page(guide_page_type)(
                    miniscreen.size, miniscreen.mode, page_redraw_speed
                )
                for guide_page_type in GuidePage
            ],
        )

        self.menu_viewport = Viewport(
            "menu",
            miniscreen,
            [
                MenuPageGenerator.get_page(menu_page_type)(
                    miniscreen.size, miniscreen.mode, page_redraw_speed
                )
                for menu_page_type in MenuPage
            ],
        )

        self.active_viewport = self.guide_viewport
        self.page_has_changed = Event()

        self.handle_automatic_transitions()

    def handle_automatic_transitions(self):
        def automatic_transition_to_last_page(_):
            if self.active_viewport != self.guide_viewport:
                return

            last_page_index = len(self.active_viewport.pages) - 1
            # Only do automatic update if on previous page
            if self.guide_viewport.page_index == last_page_index - 1:
                self.guide_viewport.page_index = last_page_index

        subscribe(AppEvents.READY_TO_BE_A_MAKER, automatic_transition_to_last_page)

    def handle_cancel_btn(self):
        print("cancel btn pressed")

        if self.active_viewport == self.guide_viewport:
            self.active_viewport = self.menu_viewport
            self.active_viewport.move_to_page(0)
        else:
            self.active_viewport = self.guide_viewport

        print(f"Current viewport: {self.active_viewport.name}")

        self.page_has_changed.set()

    def get_page(self, index):
        return self.active_viewport.pages[index]

    @property
    def page(self):
        return self.get_page(self.active_viewport.page_index)

    def needs_to_scroll(self):
        y_pos = self.active_viewport.y_pos
        correct_y_pos = self.active_viewport.page_index * self.page.height

        return y_pos != correct_y_pos

    def set_page_to(self, page):
        if self.needs_to_scroll():
            return

        new_page = page.type

        new_page_index = new_page.value - 1
        if self.active_viewport.page_index == new_page_index:
            PTLogger.debug(
                f"Miniscreen onboarding: Already on page '{new_page.name}' - nothing to do"
            )
            return

        PTLogger.debug(
            f"Page index: {self.active_viewport.page_index} -> {new_page_index}"
        )
        self.active_viewport.page_index = new_page_index
        self.page_has_changed.set()

    def set_page_to_previous_page(self):
        self.set_page_to(self.get_previous_page())

    def set_page_to_next_page(self):
        self.set_page_to(self.get_next_page())

    def get_previous_page(self):
        # Return next page if at top
        if self.active_viewport.page_index == 0:
            return self.get_next_page()

        candidate = self.get_page(self.active_viewport.page_index - 1)
        return candidate if candidate.visible else self.page

    def get_next_page(self):
        # Return current page if at end
        if self.active_viewport.page_index + 1 >= len(self.active_viewport.pages):
            return self.page

        candidate = self.get_page(self.active_viewport.page_index + 1)
        return candidate if candidate.visible else self.page

    def update(self):
        if self.needs_to_scroll():
            self.scroll_to_page()
            return

        self.active_viewport.refresh()

    def wait_until_timeout_or_page_has_changed(self):
        self.page_has_changed.wait(self.page.interval)
        if self.page_has_changed.is_set():
            self.page_has_changed.clear()

    def scroll_to_page(self):
        PTLogger.info(f"Miniscreen onboarding: Scrolling to page {self.page.type}")

        if not self.needs_to_scroll:
            return

        correct_y_pos = self.active_viewport.page_index * self._ms.size[1]

        move_down = correct_y_pos > self.active_viewport.y_pos

        direction_scalar = 1 if move_down else -1
        while correct_y_pos != self.active_viewport.y_pos:
            self.active_viewport.set_y_position(
                self.active_viewport.y_pos + (direction_scalar * scroll_px_resolution),
            )
            sleep(self.scroll_speed)
