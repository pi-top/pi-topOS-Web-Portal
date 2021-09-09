import threading

from PIL import ImageDraw
from pitop.common.logger import PTLogger

from ..event import subscribe
from .pages import ApPage, CarryOnPage, OpenBrowserPage, Pages, WelcomePage


class PageManager:
    def __init__(self, size, mode):
        self.page_has_changed = threading.Event()

        self.page_order = [
            Pages.WELCOME,
            Pages.AP,
            Pages.BROWSER,
            Pages.CARRY_ON,
        ]
        self.pages = {
            Pages.WELCOME: WelcomePage(size, mode),
            Pages.AP: ApPage(size, mode),
            Pages.BROWSER: OpenBrowserPage(size, mode),
            Pages.CARRY_ON: CarryOnPage(size, mode),
        }

        self.current_page = self.pages.get(Pages.WELCOME)

        def handle_ready_to_be_a_maker_event(ready):
            PTLogger.info("READY TO BE A MAKER, BABY")
            # Enable carry on page
            self.pages.get(Pages.CARRY_ON).visible = True

        subscribe("ready_to_be_a_maker", handle_ready_to_be_a_maker_event)

    def go_to(self, page):
        if self.current_page == page:
            PTLogger.debug(
                f"Miniscreen onboarding: Already on page '{self.current_page.type.name}' - nothing to do"
            )
            return
        self.current_page = page
        self.current_page.first_draw = True
        PTLogger.info(
            f"Miniscreen onboarding: Set page to {self.current_page.type.name}"
        )
        self.page_has_changed.set()

    def go_to_previous_page(self):
        self.go_to(self.get_previous_page(self.current_page))

    def go_to_next_page(self):
        self.go_to(self.get_next_page(self.current_page))

    def get_previous_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Return current page if at top
        current_page = self.pages.get(self.page_order[curr_idx])
        if curr_idx - 1 < 0:
            return current_page

        candidate = self.pages.get(self.page_order[curr_idx - 1])
        return candidate if candidate.visible else current_page

    def get_next_page(self, page):
        curr_idx = self.page_order.index(page.type)
        # Return current page if at end
        current_page = self.pages.get(self.page_order[curr_idx])
        if curr_idx + 1 >= len(self.page_order):
            return current_page

        candidate = self.pages.get(self.page_order[curr_idx + 1])
        return candidate if candidate.visible else current_page

    def handle_automatic_transitions(self):
        if self.current_page not in [Pages.AP, Pages.BROWSER]:
            return

        if (
            self.current_page.is_showing_info()
            and not self.get_next_page(self.current_page).visible
            and self.get_next_page(self.current_page).first_draw is False
        ):

            PTLogger.debug(
                "Miniscreen onboarding: Main loop - Handling automatic page change..."
            )
            self.go_to_next_page()

    def render_current_page(self, image):
        self.current_page.render(
            ImageDraw.Draw(image), redraw=self.current_page.first_draw
        )

    def wait_until_timeout_or_page_has_changed(self, timeout):
        self.page_has_changed.wait(self.current_page.interval)
        if self.page_has_changed.is_set():
            self.page_has_changed.clear()
