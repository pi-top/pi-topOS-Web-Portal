from time import perf_counter

from PIL import Image, ImageDraw, ImageFont

from ..attr.speeds import DEFAULT_INTERVAL


# Based on luma.core hotspots/snapshots
class PageBase:
    def __init__(self, type, size=(0, 0), mode=0):
        self.type = type
        self.size = size
        self.width = size[0]
        self.height = size[1]
        self.mode = mode
        self.interval = DEFAULT_INTERVAL
        self.last_updated = -self.interval

    @property
    def visible(self):
        return True

    def should_redraw(self):
        """
        Only requests a redraw after ``interval`` seconds have elapsed.
        """
        return perf_counter() - self.last_updated > self.interval

    def paste_into(self, image, xy):
        im = Image.new(image.mode, self.size)
        draw = ImageDraw.Draw(im)
        self.render(draw)
        image.paste(im, xy)
        del draw
        del im
        self.last_updated = perf_counter()

    def render(self, draw):
        draw.multiline_text(
            text=self.text,
            xy=(0, 0),
            fill=1,
            font=ImageFont.truetype(
                "Roboto-Regular.ttf",
                size=12,
            ),
            anchor=None,
            spacing=0,
            align="left",
            features=None,
        )
