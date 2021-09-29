from enum import Enum, auto

from pitop.miniscreen.oled.assistant import MiniscreenAssistant

from ...event import AppEvents, post_event
from .base import PageBase


class MenuPageBase(PageBase):
    def __init__(self, type, size=(0, 0), mode=0, interval=1):
        super().__init__(type, size, mode, interval)
        self.invert = True

    def on_select_press(self):
        pass

    def render(self, image):
        # Top centre
        asst = MiniscreenAssistant(self.mode, self.size)
        asst.render_text(
            image,
            xy=(self.size[0] / 2, self.size[1] / 6),
            text="M E N U",
            wrap=False,
            font=asst.get_mono_font_path(bold=True),
            font_size=self.font_size,
        )

        # Centre
        asst.render_text(
            image,
            xy=(self.size[0] / 2, self.size[1] / 2),
            text=self.text,
            wrap=self.wrap,
            font=asst.get_mono_font_path(),
            font_size=self.font_size - 2,
        )


class MenuPage(Enum):
    SKIP = auto()
    BUILD_INFO = auto()


class MenuPageGenerator:
    @staticmethod
    def get_page(page_type: MenuPage):
        pages = {
            MenuPage.SKIP: SkipToEndPage,
            MenuPage.BUILD_INFO: BuildInfoPage,
        }

        return pages[page_type]


class SkipToEndPage(MenuPageBase):
    """
    Do you want to skip?
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=MenuPage.SKIP, size=size, mode=mode, interval=interval)
        self.text = "Skip pi-top connection guide?"

    def on_select_press(self):
        post_event(AppEvents.USER_SKIPPED_CONNECTION_GUIDE, True)


class BuildInfoPage(MenuPageBase):
    """
    Show build info
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=MenuPage.BUILD_INFO, size=size, mode=mode, interval=interval
        )
        self.text = "TODO: show build/battery info..."
