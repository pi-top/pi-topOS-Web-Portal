import logging

from pitop.battery import Battery
from pitop.common.pt_os import get_pitopOS_info
from pitop.common.sys_info import NetworkInterface, get_internal_ip
from pt_miniscreen.core import Component
from pt_miniscreen.core.components import Text
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
            text = "Are you stuck?\nGo to\npi-top.com/start-4",
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
            text=self.text,
            font_size=FONT_SIZE,
            align="center",
            vertical_align="center",
            fill=0,
        )

    @property
    def text(self):
        ips = list()

        for iface in NetworkInterface:
            ip = get_internal_ip(iface.name)
            if ip.replace("Internet Addresses Not Found", ""):
                ips.append(ip)

        return "\n".join(ips)

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
