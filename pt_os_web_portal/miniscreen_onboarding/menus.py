from enum import Enum, IntEnum
from pathlib import Path
from threading import Thread
from time import sleep

from PIL import Image, ImageDraw
from pitop.common.pt_os import get_pitopOS_info
from pitop.common.sys_info import (
    get_address_for_connected_device,
    get_internal_ip,
    is_connected_to_internet,
)

from ..backend.helpers.extras import started_onboarding_breadcrumb
from .connection_methods import ApConnection, EthernetConnection, UsbConnection
from .helpers import draw_text, get_image_file_path, process_image

# Tunings to approximately match other sys info pages using GIFs
ANIMATION_SPEED = 1
ANIMATION_SLEEP_INTERVAL = 0.005
STATIONARY_SLEEP_INTERVAL = 0.5
FIRST_DRAW_SLEEP_INTERVAL = 1
DEFAULT_INTERVAL = 0.2

# Formatting text in miniscreen
INFO_PAGE_MARGIN_X = 29
FIRST_LINE_Y = 9
SECOND_LINE_Y = 25
THIRD_LINE_Y = 41


class Menus(IntEnum):
    WELCOME = 0
    AP = 1
    BROWSER = 2
    CARRY_ON = 3
    # USB = 2
    # ETHERNET = 3
    # INFO = 4

    def next(self):
        next_mode = self.value + 1 if self.value + 1 < len(Menus) else 0
        return Menus(next_mode)

    def previous(self):
        previous = self.value - 1 if self.value - 1 >= 0 else len(Menus) - 1
        return Menus(previous)


class MenuPageBase:
    def __init__(self, type, size=(0, 0), mode=0):
        self.type = type
        self.size = size
        self.mode = mode
        self.interval = DEFAULT_INTERVAL
        self.skip = False

    def render(self, draw, redraw=False):
        raise NotImplementedError

    def should_display(self):
        return not self.skip


class TitleMenuPage(MenuPageBase):
    def __init__(
        self,
        type,
        title_image_filename="",
        size=(0, 0),
        mode=0,
    ):
        super(TitleMenuPage, self).__init__(type, size, mode)

        self.interval = STATIONARY_SLEEP_INTERVAL
        self.render_state = RenderState.STATIONARY

        self.title_image = process_image(
            Image.open(get_image_file_path(title_image_filename)), size, mode
        )

        self.title_image_pos = (0, 0)
        self.first_draw = True

    def draw_connection_data(self, draw):
        raise NotImplementedError

    def reset_animation(self):
        self.title_image_pos = (0, 0)
        self.render_state = RenderState.STATIONARY
        self.first_draw = True

    def set_interval(self):
        if self.first_draw:
            self.interval = FIRST_DRAW_SLEEP_INTERVAL
        elif self.render_state == RenderState.STATIONARY:
            self.interval = STATIONARY_SLEEP_INTERVAL
        elif self.render_state == RenderState.ANIMATING:
            self.interval = ANIMATION_SLEEP_INTERVAL
        else:
            self.interval = DEFAULT_INTERVAL

    def info(self, draw, redraw=False):
        raise NotImplementedError

    def render(self, draw, redraw=False):
        if redraw:
            self.reset_animation()

        if not self.first_draw:
            if self.title_image_pos[0] <= -self.size[0]:
                self.render_state = RenderState.DISPLAYING_INFO
            elif self.render_state != RenderState.DISPLAYING_INFO:
                self.render_state = RenderState.ANIMATING
                self.title_image_pos = (
                    self.title_image_pos[0] - ANIMATION_SPEED,
                    0,
                )

        if self.render_state == RenderState.DISPLAYING_INFO:
            self.info(draw)
        else:
            draw.bitmap(
                xy=self.title_image_pos,
                bitmap=self.title_image,
                fill="white",
            )

        self.set_interval()
        self.first_draw = False


class WelcomeMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(WelcomeMenuPage, self).__init__(
            type=Menus.WELCOME, size=size, mode=mode, title_image_filename="welcome.png"
        )

    def info(self, draw, redraw=False):
        draw_text(
            draw,
            text="Press the blue",
            xy=(15, FIRST_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="down key",
            xy=(15, SECOND_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="to page!",
            xy=(15, THIRD_LINE_Y),
            font_size=14,
        )

    def render(self, draw, redraw=False):
        super(WelcomeMenuPage, self).render(draw, redraw)


class CarryOnMenuPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(CarryOnMenuPage, self).__init__(
            type=Menus.CARRY_ON,
            size=size,
            mode=mode,
            title_image_filename="carryon.png",
        )
        self.already_displayed = False
        self.thread = Thread(target=self.__monitor_breadcrumb, args=(), daemon=True)
        self.thread.start()

    def should_display(self):
        should = not self.skip and self.already_displayed is False
        if should:
            self.already_displayed = True
        return should

    def __monitor_breadcrumb(self):
        file = Path(started_onboarding_breadcrumb)
        while True:
            self.skip = not file.exists()
            sleep(0.3)

    def info(self, draw, redraw=False):
        draw_text(
            draw,
            text="Now, continue",
            xy=(10, FIRST_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="onboarding in",
            xy=(10, SECOND_LINE_Y),
            font_size=14,
        )
        draw_text(
            draw,
            text="the browser",
            xy=(10, THIRD_LINE_Y),
            font_size=14,
        )


class InfoMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(InfoMenuPage, self).__init__(type=Menus.INFO, size=size, mode=mode)

    def render(self, draw, redraw=False):
        build_info = get_pitopOS_info()
        draw_text(draw, text="pi-topOS", xy=(INFO_PAGE_MARGIN_X / 2, FIRST_LINE_Y))
        draw_text(
            draw,
            text=f"Build: {build_info.build_run_number}",
            xy=(INFO_PAGE_MARGIN_X / 2, SECOND_LINE_Y),
        )
        draw_text(
            draw,
            text=f"Date: {build_info.build_date}",
            xy=(INFO_PAGE_MARGIN_X / 2, THIRD_LINE_Y),
        )


class OpenBrowserPage(TitleMenuPage):
    def __init__(self, size, mode):
        super(OpenBrowserPage, self).__init__(
            type=Menus.BROWSER,
            size=size,
            mode=mode,
            title_image_filename="connected.png",
        )
        self.skip = True
        self.connected_ip = ""
        self.already_displayed = False
        self.thread = Thread(target=self.__monitor_connections, args=(), daemon=True)
        self.thread.start()

    def should_display(self):
        should = not self.skip and self.already_displayed is False
        if should:
            self.already_displayed = True
        return should

    def __monitor_connections(self):
        while True:
            self.connected_ip = get_address_for_connected_device()
            self.skip = self.connected_ip == "" and not is_connected_to_internet()
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


class RenderState(Enum):
    STATIONARY = 0
    ANIMATING = 1
    DISPLAYING_INFO = 2


class ConnectionMenuPage(MenuPageBase):
    def __init__(
        self,
        type,
        connection_state=None,
        title_image_filename="",
        info_image_filename="",
        size=(0, 0),
        mode=0,
    ):
        super(ConnectionMenuPage, self).__init__(type, size, mode)

        self.connection_state = connection_state
        self.interval = STATIONARY_SLEEP_INTERVAL
        self.render_state = RenderState.STATIONARY

        self.title_connected_image = process_image(
            Image.open(get_image_file_path(title_image_filename)), size, mode
        )
        self.title_disconnected_image = self.title_connected_image.copy()

        def add_disconnected_icon(pil_image):
            canvas = ImageDraw.Draw(pil_image)
            canvas.ellipse((70, 23) + (84, 37), fill=0, outline=0)
            canvas.ellipse((71, 24) + (83, 36), fill=1, outline=0)
            canvas.line((74, 27) + (79, 32), fill=0, width=2)
            canvas.line((75, 32) + (80, 27), fill=0, width=2)

        add_disconnected_icon(self.title_disconnected_image)

        self.info_image = process_image(
            Image.open(get_image_file_path(info_image_filename)), size, mode
        )

        self.title_image_pos = (0, 0)
        self.first_draw = True
        self.is_connected = False

    def draw_connection_data(self, draw):
        raise NotImplementedError

    def reset_animation(self):
        self.title_image_pos = (0, 0)
        self.render_state = RenderState.STATIONARY
        self.first_draw = True

    def set_interval(self):
        if self.first_draw:
            self.interval = FIRST_DRAW_SLEEP_INTERVAL
        elif self.render_state == RenderState.STATIONARY:
            self.interval = STATIONARY_SLEEP_INTERVAL
        elif self.render_state == RenderState.ANIMATING:
            self.interval = ANIMATION_SLEEP_INTERVAL
        else:
            self.interval = DEFAULT_INTERVAL

    def render(self, draw, redraw=False):
        if redraw or self.render_state != RenderState.ANIMATING:
            self.connection_state.update()
            self.is_connected = self.connection_state.is_connected()
            if redraw or not self.is_connected:
                self.reset_animation()

        if not self.first_draw:
            if self.is_connected:
                if self.title_image_pos[0] <= -self.size[0]:
                    self.render_state = RenderState.DISPLAYING_INFO
                elif self.render_state != RenderState.DISPLAYING_INFO:
                    self.render_state = RenderState.ANIMATING
                    self.title_image_pos = (
                        self.title_image_pos[0] - ANIMATION_SPEED,
                        0,
                    )
            elif self.render_state != RenderState.STATIONARY:
                self.reset_animation()

        if self.render_state == RenderState.DISPLAYING_INFO:
            draw.bitmap(
                xy=(0, 0),
                bitmap=self.info_image,
                fill="white",
            )
            self.draw_connection_data(draw)
        else:
            title_image = (
                self.title_connected_image
                if self.is_connected
                else self.title_disconnected_image
            )
            draw.bitmap(
                xy=self.title_image_pos,
                bitmap=title_image,
                fill="white",
            )

        self.set_interval()
        self.first_draw = False


class ApMenuPage(ConnectionMenuPage):
    def __init__(self, size, mode):
        super(ApMenuPage, self).__init__(
            type=Menus.AP,
            connection_state=ApConnection(),
            title_image_filename="ap_title.png",
            info_image_filename="ap_info.png",
            size=size,
            mode=mode,
        )

    def draw_connection_data(self, draw):
        draw_text(draw, text="Wi-Fi network:", xy=(10, 6))
        draw_text(
            draw,
            text=self.connection_state.metadata.get("ssid", ""),
            xy=(INFO_PAGE_MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(
            draw,
            text=self.connection_state.metadata.get("passphrase", ""),
            xy=(INFO_PAGE_MARGIN_X, THIRD_LINE_Y),
        )


class UsbMenuPage(ConnectionMenuPage):
    def __init__(self, size, mode):
        super(UsbMenuPage, self).__init__(
            type=Menus.USB,
            connection_state=UsbConnection(),
            title_image_filename="usb_title.png",
            info_image_filename="usb_info.png",
            size=size,
            mode=mode,
        )

    def draw_connection_data(self, draw):
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("username", "")),
            xy=(INFO_PAGE_MARGIN_X, FIRST_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("password", "")),
            xy=(INFO_PAGE_MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.ip),
            xy=(INFO_PAGE_MARGIN_X, THIRD_LINE_Y),
        )


class EthernetMenuPage(ConnectionMenuPage):
    def __init__(self, size, mode):
        super(EthernetMenuPage, self).__init__(
            type=Menus.ETHERNET,
            connection_state=EthernetConnection(),
            title_image_filename="lan_title.png",
            info_image_filename="lan_info.png",
            size=size,
            mode=mode,
        )

    def draw_connection_data(self, draw):
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("username", "")),
            xy=(INFO_PAGE_MARGIN_X, FIRST_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("password", "")),
            xy=(INFO_PAGE_MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.ip),
            xy=(INFO_PAGE_MARGIN_X, THIRD_LINE_Y),
        )
