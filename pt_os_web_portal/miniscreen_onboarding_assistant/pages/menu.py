import logging

from pitop.battery import Battery
from pitop.common.pt_os import get_pitopOS_info
from pitop.common.sys_info import get_pi_top_ip
from psutil import AF_LINK, net_if_addrs
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import MarqueeText, Text
from pt_miniscreen.core.utils import apply_layers, layer, rectangle

from ...backend.helpers.device import firmware_version

logger = logging.getLogger(__name__)


FONT_SIZE = 14
SIZE = (128, 64)
TEXT_POS = (0, 0)


class DetailedInstructionsPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text="Are you stuck?\nGo to\npi-top.com/start-4",
            wrap=False,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class BatteryInfoPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.battery_instance = Battery()

        self.text_component = self.create_child(
            Text,
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    @property
    def text(self):
        def _power_source_text():
            if self.battery_instance.is_full or self.battery_instance.is_charging:
                return "Power Adapter"
            return "Battery"

        return (
            f"Battery: {self.battery_instance.capacity}%\n"
            f"Power Source: {_power_source_text()}"
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class OsInfoPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        build_info = get_pitopOS_info()
        text = (
            f"pi-topOS v{build_info.build_os_version}\n"
            f"{build_info.build_type}\n" + f"{build_info.build_date}"
        )

        self.text_component = self.create_child(
            Text,
            text=text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class FwInfoPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        build_info = get_pitopOS_info()
        text = (
            f"pi-top Firmware: {firmware_version()}\n"
            + f"Schema: {build_info.schema_version}\n"
            + f"Run: {build_info.build_run_number}\n"
            + f"#: {build_info.build_commit}"
        )

        self.text_component = self.create_child(
            Text,
            text=text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


class NetworksPage(Component):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.text_component = self.create_child(
            Text,
            text=f"IP address:\n{get_pi_top_ip()}",
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    def render(self, image):
        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.text_component.render,
                    size=SIZE,
                    pos=TEXT_POS,
                ),
            ],
        )


def iface_mac_address(iface_name: str) -> str:
    iface_name_lookup = {
        "eth0": "Eth",
        "wlan0": "WiFi",
        "wlan_ap0": "AP",
    }

    txt = ""

    try:
        nics = net_if_addrs()
    except Exception:
        return txt
    if iface_name in nics:
        for data in nics[iface_name]:
            if (
                hasattr(data, "family")
                and hasattr(data, "address")
                and data.family == AF_LINK
            ):
                txt = f"{iface_name_lookup.get(iface_name)}: {data.address}"
                break

    return txt


class MacAddressesPage(Component):
    FONT_SIZE = 10
    TITLE_FONT_SIZE = 12
    VERTICAL_PADDING = 4
    HORIZONTAL_MARGIN = 5

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.title = self.create_child(
            Text,
            text="MAC Addresses",
            font_size=self.TITLE_FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

        self.wlan0 = self.create_child(
            MarqueeText,
            font_size=self.FONT_SIZE,
            vertical_align="center",
            fill=0,
            text=iface_mac_address("wlan0"),
            get_text=lambda: iface_mac_address("wlan0"),
        )
        self.eth0 = self.create_child(
            MarqueeText,
            font_size=self.FONT_SIZE,
            vertical_align="center",
            fill=0,
            text=iface_mac_address("eth0"),
            get_text=lambda: iface_mac_address("eth0"),
        )
        self.wlan_ap0 = self.create_child(
            MarqueeText,
            font_size=self.FONT_SIZE,
            vertical_align="center",
            fill=0,
            text=iface_mac_address("wlan_ap0"),
            get_text=lambda: iface_mac_address("wlan_ap0"),
        )

    def render(self, image):
        data_row_size = (
            SIZE[0] - 2 * self.HORIZONTAL_MARGIN,
            self.FONT_SIZE + self.VERTICAL_PADDING,
        )

        def data_row_pos(cell_number):
            return (
                self.HORIZONTAL_MARGIN,
                self.TITLE_FONT_SIZE
                + self.VERTICAL_PADDING
                + (cell_number - 1) * (self.FONT_SIZE + self.VERTICAL_PADDING),
            )

        return apply_layers(
            image,
            [
                layer(rectangle, size=SIZE, pos=(0, 0)),
                layer(
                    self.title.render,
                    size=(SIZE[0], self.TITLE_FONT_SIZE + self.VERTICAL_PADDING),
                    pos=(0, 0),
                ),
                layer(self.wlan0.render, size=data_row_size, pos=data_row_pos(1)),
                layer(self.eth0.render, size=data_row_size, pos=data_row_pos(2)),
                layer(self.wlan_ap0.render, size=data_row_size, pos=data_row_pos(3)),
            ],
        )
