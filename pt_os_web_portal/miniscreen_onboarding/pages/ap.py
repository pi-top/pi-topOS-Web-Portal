from .attr.margins import INFO_PAGE_MARGIN_X, SECOND_LINE_Y, THIRD_LINE_Y
from .base._connection_base import ConnectionPage
from .connection.methods import ApConnection
from .pages import Pages
from .render.helpers import draw_text


class ApPage(ConnectionPage):
    def __init__(self, size, mode):
        super(ApPage, self).__init__(
            type=Pages.AP,
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