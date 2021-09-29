from enum import Enum, auto

from .base import PageBase


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


# Special pages - not used in scrolling
class SkipToEndPage(PageBase):
    """
    Do you want to skip?
    """

    def __init__(self, size, mode, interval):
        super().__init__(type=MenuPage.SKIP, size=size, mode=mode, interval=interval)
        self.text = "Do you want to skip?"
        self.invert = True


class BuildInfoPage(PageBase):
    """
    Show build info
    """

    def __init__(self, size, mode, interval):
        super().__init__(
            type=MenuPage.BUILD_INFO, size=size, mode=mode, interval=interval
        )
        self.text = "Show build info!"
        self.invert = True
