import logging

from pt_miniscreen.core.component import Component
from pt_miniscreen.core.components import ArrowNavigationIndicator, PageList, Stack
from pt_miniscreen.core.utils import apply_layers, layer

from pt_os_web_portal.event import AppEvents, subscribe

from .pages import (
    BatteryInfoPage,
    CarryOnPage,
    ConnectPitopWifiNetworkPage,
    FwInfoPage,
    GetDevicePage,
    HelpURLPage,
    NetworksPage,
    OpenBrowserPage,
    OsInfoPage,
    SkipPage,
    StartPage,
    WaitConnectionPage,
)

logger = logging.getLogger(__name__)


class GuidePageList(PageList):
    def __init__(self, **kwargs):
        super().__init__(
            **kwargs,
            visible_scrollbar=False,
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


class MenuPageList(PageList):
    def __init__(self, **kwargs):
        super().__init__(
            **kwargs,
            visible_scrollbar=False,
            Pages=[
                SkipPage,
                BatteryInfoPage,
                OsInfoPage,
                FwInfoPage,
                NetworksPage,
            ],
        )


class RootComponent(Component):
    arrow_navigation_indicator_width = 10

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.stack = self.create_child(Stack, initial_stack=[GuidePageList])
        self.arrow_navigation_indicator = self.create_child(
            ArrowNavigationIndicator, top_arrow_visible=False, bottom_arrow_visible=True
        )
        self.setup_event_triggers()

    def setup_event_triggers(self):
        # Automatic transitions between pages during navigation
        def soft_transition_to_open_browser_page(connected):
            if not connected or not isinstance(self.active_component, GuidePageList):
                return

            # Only transition if on 'Connect to Network' or 'Waiting for Connection' pages
            pages_in_list = self.active_component.distance_to_bottom
            if pages_in_list in (3, 2):
                self.stack.active_component.scroll_to(
                    direction="DOWN", distance=pages_in_list - 1
                )

        subscribe(AppEvents.HAS_CONNECTED_DEVICE, soft_transition_to_open_browser_page)
        subscribe(
            AppEvents.IS_CONNECTED_TO_INTERNET, soft_transition_to_open_browser_page
        )

        def soft_transition_to_last_page(_):
            if not isinstance(self.active_component, GuidePageList):
                return

            # Only do automatic update if on 'Open Browser' page
            if len(self.active_component.rows) == 2:
                self.stack.active_component.scroll_down()

        subscribe(AppEvents.READY_TO_BE_A_MAKER, soft_transition_to_last_page)

        def update_page_state(cls, attribute_name, attribute_value):
            if isinstance(self.active_page, cls):
                self.active_page.state.update({attribute_name: attribute_value})
                return
            setattr(cls, attribute_name, attribute_value)

        # ConnectPitopWifiNetworkPage state update
        subscribe(
            AppEvents.AP_HAS_SSID,
            lambda ssid: update_page_state(ConnectPitopWifiNetworkPage, "ssid", ssid),
        )
        subscribe(
            AppEvents.AP_HAS_PASSPHRASE,
            lambda passphrase: update_page_state(
                ConnectPitopWifiNetworkPage, "passphrase", passphrase
            ),
        )

        # WaitConnectionPage state update
        subscribe(
            AppEvents.HAS_CONNECTED_DEVICE,
            lambda is_connected: update_page_state(
                WaitConnectionPage, "is_connected_to_internet", is_connected
            ),
        )
        subscribe(
            AppEvents.IS_CONNECTED_TO_INTERNET,
            lambda has_connected_device: update_page_state(
                WaitConnectionPage, "has_connected_device", has_connected_device
            ),
        )

    @property
    def active_component(self):
        return self.stack.active_component

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

    def switch_menu(self):
        if isinstance(self.stack.active_component, GuidePageList):
            self.stack.push(MenuPageList)
            return
        self.stack.pop()

    def handle_select_button(self):
        if isinstance(self.stack.active_component, MenuPageList) and isinstance(
            self.active_page, SkipPage
        ):
            self.stack.pop()
            # Scroll to OpenBrowserPage
            pages_in_list = self.active_component.distance_to_bottom
            if pages_in_list > 1:
                self.stack.active_component.scroll_to(
                    direction="DOWN", distance=pages_in_list - 1
                )
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
