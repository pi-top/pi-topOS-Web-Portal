from threading import Event

from pitop.common.logger import PTLogger
from pitop.miniscreen.oled.core.contrib.luma.core.virtual import viewport

from .pages import ApPage, CarryOnPage, OpenBrowserPage, Pages, WelcomePage


class PageManager:
    PAGE_ORDER = [
        Pages.WELCOME,
        Pages.AP,
        Pages.BROWSER,
        Pages.CARRY_ON,
    ]

    def __init__(self, miniscreen, default_page_interval=1):
        self._miniscreen = miniscreen

        self.current_page_index = 0

        size = miniscreen.size
        width = size[0]
        height = size[1]

        mode = miniscreen.mode

        self.viewport = viewport(
            miniscreen.device,
            width=width,
            height=height * len(self.PAGE_ORDER),
        )
        self.viewport.set_position((0, self.current_page_index * height))

        self.page_has_changed = Event()

        welcome = WelcomePage(size, mode, default_page_interval)
        ap = ApPage(size, mode, default_page_interval)
        openbrowser = OpenBrowserPage(size, mode, default_page_interval)
        carryon = CarryOnPage(size, mode, default_page_interval)

        for i, page in enumerate(
            [
                welcome,
                ap,
                openbrowser,
                carryon,
            ]
        ):
            self.viewport.add_hotspot(page, (0, i * height))

    def get_page(self, index):
        page, pos = self.viewport._hotspots[index]
        return page

    @property
    def current_page(self):
        return self.get_page(self.current_page_index)

    def viewport_position_is_correct(self):
        return (
            self.viewport._position[1]
            == self.current_page_index * self.current_page.height
        )

    def set_current_page_to(self, page):
        new_page_index = self.PAGE_ORDER.index(page.type)
        if self.current_page_index == new_page_index:
            PTLogger.debug(
                f"Miniscreen onboarding: Already on page '{self.PAGE_ORDER[self.current_page_index].name}' - nothing to do"
            )
            return

        self.current_page_index = new_page_index
        self.page_has_changed.set()

    def set_current_page_to_previous_page(self):
        self.set_current_page_to(self.get_previous_page())

    def set_current_page_to_next_page(self):
        self.set_current_page_to(self.get_next_page())

    def get_previous_page(self):
        # Return current page if at top
        if self.current_page_index <= 0:
            return self.current_page

        candidate = self.get_page(self.current_page_index - 1)
        return candidate if candidate.visible else self.current_page

    def get_next_page(self):
        # Return current page if at end
        if self.current_page_index + 1 >= len(self.PAGE_ORDER):
            return self.current_page

        candidate = self.get_page(self.current_page_index + 1)
        return candidate if candidate.visible else self.current_page

    def handle_automatic_transitions(self):
        if self.current_page not in [Pages.AP, Pages.BROWSER]:
            return

        if not self.get_next_page(self.current_page).visible:
            PTLogger.debug(
                "Miniscreen onboarding: Main loop - Handling automatic page change..."
            )
            self.set_current_page_to_next_page()

    def refresh(self):
        self.viewport.refresh()

    def wait_until_timeout_or_page_has_changed(self):
        self.page_has_changed.wait(self.current_page.interval)
        if self.page_has_changed.is_set():
            self.page_has_changed.clear()
