import logging

from pt_miniscreen.components.arrow_navigation_indicator import ArrowNavigationIndicator
from pt_miniscreen.core.component import Component
from pt_miniscreen.core.components import PageList, Stack
from pt_miniscreen.core.utils import apply_layers, layer

from .pages import (
    CarryOnPage,
    ConnectPitopWifiNetworkPage,
    GetDevicePage,
    HelpURLPage,
    OpenBrowserPage,
    StartPage,
    WaitConnectionPage,
)

logger = logging.getLogger(__name__)


class RootPageList(PageList):
    def __init__(self, **kwargs):
        super().__init__(
            **kwargs,
            Pages=[
                StartPage,
                GetDevicePage,
                HelpURLPage,
                ConnectPitopWifiNetworkPage,
                WaitConnectionPage,
                OpenBrowserPage,
                CarryOnPage,
            ],
        )
        self.visible_scrollbar = False


class RootComponent(Component):
    arrow_navigation_indicator_width = 10

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.stack = self.create_child(Stack, initial_stack=[RootPageList])
        self.arrow_navigation_indicator = self.create_child(
            ArrowNavigationIndicator, top_arrow_visible=False, bottom_arrow_visible=True
        )

    @property
    def active_page(self):
        if isinstance(self.stack.active_component, PageList):
            return self.stack.active_component.current_page

    @property
    def can_scroll(self):
        return isinstance(self.stack.active_component, PageList)

    @property
    def can_scroll_up(self):
        return self.can_scroll and self.stack.active_component.can_scroll_up

    @property
    def can_scroll_down(self):
        return self.can_scroll and self.stack.active_component.can_scroll_down

    def _update_navigation_component(self):
        self.arrow_navigation_indicator.upper_arrow.state.update(
            {"visible": self.can_scroll_up}
        )
        self.arrow_navigation_indicator.lower_arrow.state.update(
            {"visible": self.can_scroll_down}
        )

    def scroll_up(self):
        if self.can_scroll_up:
            self.stack.active_component.scroll_up()
            self._update_navigation_component()

    def scroll_down(self):
        if self.can_scroll_down:
            self.stack.active_component.scroll_down()
            self._update_navigation_component()

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(
                    self.stack.render,
                    size=(image.width, image.height),
                    pos=(0, 0),
                ),
                layer(
                    self.arrow_navigation_indicator.render,
                    size=(self.arrow_navigation_indicator_width, image.height),
                    pos=(0, 0),
                ),
            ],
        )
