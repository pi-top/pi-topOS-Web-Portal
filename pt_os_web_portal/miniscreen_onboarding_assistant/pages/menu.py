from enum import Enum, auto

from pitop.common.pt_os import get_pitopOS_info
from pitop.miniscreen.oled.assistant import MiniscreenAssistant

from ...event import AppEvents, post_event
from .base import PageBase

build_info = get_pitopOS_info()


class MenuPageBase(PageBase):
    def __init__(self, type, size=(0, 0), mode=0, interval=1):
        super().__init__(type, size, mode, interval)
        self.invert = True

    def on_select_press(self):
        pass

    def render(self, image):
        title_overlay_h = 19

        center_x = self.size[0] / 2
        offset_center_y = title_overlay_h + (self.size[1] - title_overlay_h) / 2
        asst = MiniscreenAssistant(self.mode, self.size)
        asst.render_text(
            image,
            xy=(center_x, offset_center_y),
            text=self.text,
            wrap=self.wrap,
            font=asst.get_mono_font_path(),
            font_size=self.font_size - 2,
        )


class MenuPage(Enum):
    SKIP = auto()
    BUILD_INFO = auto()
    ADDITIONAL_BUILD_INFO = auto()


class MenuPageGenerator:
    @staticmethod
    def get_page(page_type: MenuPage):
        pages = {
            MenuPage.SKIP: SkipToEndPage,
            MenuPage.BUILD_INFO: BuildInfoPage,
            MenuPage.ADDITIONAL_BUILD_INFO: AdditionalBuildInfoPage,
        }

        return pages[page_type]


class SkipToEndPage(MenuPageBase):
    """
    Skip pi-top connection guide?
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=MenuPage.SKIP, size=size, mode=mode, interval=interval)
        self.text = "Skip pi-top connection guide?"

    def on_select_press(self):
        post_event(AppEvents.USER_SKIPPED_CONNECTION_GUIDE, True)


class BuildInfoPage(MenuPageBase):
    """
    pi-topOS v3.0
    experimental
    2021-09-29
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=MenuPage.BUILD_INFO, size=size, mode=mode, interval=interval
        )
        self.wrap = False

        self.text = (
            f"pi-topOS v{build_info.build_os_version}\n"
            f"{build_info.build_type}\n" + f"{build_info.build_date}"
        )


class AdditionalBuildInfoPage(MenuPageBase):
    """
    Schema: 1
    Run: 554
    #: b2da89ff
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=MenuPage.ADDITIONAL_BUILD_INFO, size=size, mode=mode, interval=interval
        )
        self.wrap = False

        self.text = (
            f"Schema: {build_info.schema_version}\n"
            + f"Run: {build_info.build_run_number}\n"
            + f"#: {build_info.build_commit}"
        )
