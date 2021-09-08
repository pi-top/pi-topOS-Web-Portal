from ..menus import Menus
from .attr.margins import FIRST_LINE_Y, INFO_PAGE_MARGIN_X, SECOND_LINE_Y, THIRD_LINE_Y
from .base._connection_base import ConnectionMenuPage
from .connection.methods import UsbConnection
from .render.helpers import draw_text


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
