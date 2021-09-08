from pitop.common.pt_os import get_pitopOS_info

from ..menus import Menus
from ._base import MenuPageBase
from .attr.margins import FIRST_LINE_Y, INFO_PAGE_MARGIN_X, SECOND_LINE_Y, THIRD_LINE_Y
from .helpers import draw_text


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
