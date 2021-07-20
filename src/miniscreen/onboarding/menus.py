from enum import Enum, IntEnum

from PIL import Image, ImageDraw

from .connection_methods import ApConnection, EthernetConnection, UsbConnection
from .helpers import draw_text, get_image_file_path, process_image

# Tunings to approximately match other sys info pages using GIFs
ANIMATION_SPEED = 1
ANIMATION_SLEEP_INTERVAL = 0.005
STATIONARY_SLEEP_INTERVAL = 0.5
FIRST_DRAW_SLEEP_INTERVAL = 1
DEFAULT_INTERVAL = 0.2

# Formatting text in miniscreen
MARGIN_X = 29
FIRST_LINE_Y = 9
SECOND_LINE_Y = 25
THIRD_LINE_Y = 41


class Menus(IntEnum):
    AP = 0
    USB = 1
    ETHERNET = 2
    INFO = 3

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

    def render(self, draw, redraw=False):
        raise NotImplementedError


class InfoMenuPage(MenuPageBase):
    def __init__(self, size, mode):
        super(InfoMenuPage, self).__init__(type=Menus.INFO, size=size, mode=mode)

    def render(self, draw, redraw=False):
        build_data = self.build_data()
        draw_text(draw, text="pi-topOS", xy=(MARGIN_X / 2, FIRST_LINE_Y))
        draw_text(
            draw,
            text=f"Build: {build_data.get('build_number')}",
            xy=(MARGIN_X / 2, SECOND_LINE_Y),
        )
        draw_text(
            draw,
            text=f"Date: {build_data.get('build_date')}",
            xy=(MARGIN_X / 2, THIRD_LINE_Y),
        )

    def __get_file_lines(self, filename):
        lines = list()
        try:
            with open(filename) as fp:
                lines = fp.readlines()
        except Exception:
            pass
        return lines

    def build_data(self):
        headers = ("Build Number", "Build Date")
        data = {}
        for line in self.__get_file_lines("/etc/pt-issue"):
            try:
                title, value = line.strip().split(": ")
                if title in headers:
                    data[title.replace(" ", "_").lower()] = value
            except Exception:
                continue
        return data


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
        draw_text(
            draw,
            text=self.connection_state.metadata.get("ssid", ""),
            xy=(MARGIN_X, FIRST_LINE_Y),
        )
        draw_text(
            draw,
            text=self.connection_state.metadata.get("passphrase", ""),
            xy=(MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(draw, text=self.connection_state.ip, xy=(MARGIN_X, THIRD_LINE_Y))


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
            xy=(MARGIN_X, FIRST_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("password", "")),
            xy=(MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(draw, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))


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
            xy=(MARGIN_X, FIRST_LINE_Y),
        )
        draw_text(
            draw,
            text=str(self.connection_state.metadata.get("password", "")),
            xy=(MARGIN_X, SECOND_LINE_Y),
        )
        draw_text(draw, text=str(self.connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y))
