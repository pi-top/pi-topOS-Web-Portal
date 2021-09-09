from threading import Thread
from time import sleep

from pitop.common.sys_info import (
    get_address_for_connected_device,
    get_internal_ip,
    is_connected_to_internet,
)

from ...menus import Menus
from ..attr.margins import FIRST_LINE_Y, SECOND_LINE_Y, THIRD_LINE_Y
from ..base._title_base import TitleMenuPage
from ..render.helpers import draw_text


class OpenBrowserMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(OpenBrowserMenuPage, self).__init__(
            type=Menus.BROWSER,
            size=size,
            mode=mode,
            title_image_filename="connected.png",
        )
        self.visible = False
        self.connected_ip = ""
        self.thread = Thread(target=self.__monitor_connections, args=(), daemon=True)
        self.thread.start()

    def __monitor_connections(self):
        while True:
            self.connected_ip = get_address_for_connected_device()
            self.visible = self.connected_ip != "" or is_connected_to_internet()
            sleep(0.3)

    def get_ip_to_connect(self):
        if not self.connected_ip:
            return
        ip_arr = self.connected_ip.split(".")
        for interface in ("ptusb0", "wlan_ap0"):
            iface_ip = get_internal_ip(interface)
            iface_ip_arr = iface_ip.split(".")
            if ip_arr[:3] == iface_ip_arr[:3]:
                return iface_ip

    def info(self, draw, redraw=False):
        draw_text(draw, text="Open a browser to", font_size=11, xy=(5, FIRST_LINE_Y))
        draw_text(
            draw,
            text="http://pi-top.local",
            font_size=11,
            xy=(5, SECOND_LINE_Y),
        )
        ip_to_connect = self.get_ip_to_connect()
        if ip_to_connect:
            draw_text(
                draw,
                text=f"or http://{ip_to_connect}",
                font_size=11,
                xy=(5, THIRD_LINE_Y),
            )
