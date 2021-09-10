from PIL import Image

from .attr.margins import INFO_PAGE_MARGIN_X, SECOND_LINE_Y, THIRD_LINE_Y
from .base._base import PageBase
from .connection.methods import ApConnection
from .pages import Pages
from .render.helpers import draw_text, get_image_file_path, process_image


class ApPage(PageBase):
    def __init__(self, size, mode):
        super(ApPage, self).__init__(
            type=Pages.AP,
            size=size,
            mode=mode,
        )

        self.connection_state = ApConnection()
        self.info_image = process_image(
            Image.open(get_image_file_path("ap_info.png")), size, mode
        )
        self.is_connected = False

    def render(self, draw):
        draw.bitmap(
            xy=(0, 0),
            bitmap=self.info_image,
            fill="white",
        )
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
