from time import perf_counter

from PIL import Image, ImageDraw, ImageFont


# Based on luma.core hotspots/snapshots
class PageBase:
    def __init__(self, type, size=(0, 0), mode=0, interval=1):
        self.type = type
        self.size = size
        self.width = size[0]
        self.height = size[1]
        self.mode = mode
        self.interval = interval
        self.last_updated = -self.interval
        self.visible = True
        self.font_size = 14
        self.wrap = True

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
        def text_wrap(text, font, max_width):
            """Wrap text base on specified width.
            This is to enable text of width more than the image width to be display
            nicely.
            @params:
                text: str
                    text to wrap
                font: obj
                    font of the text
                max_width: int
                    width to split the text with
            @return
                lines: list[str]
                    list of sub-strings
            """
            lines = []

            # If the text width is smaller than the image width, then no need to split
            # just add it to the line list and return
            if font.getsize(text)[0] <= max_width:
                lines.append(text)
            else:
                # split the line by spaces to get words
                words = text.split(" ")
                i = 0
                # append every word to a line while its width is shorter than the image width
                while i < len(words):
                    line = ""
                    while (
                        i < len(words) and font.getsize(line + words[i])[0] <= max_width
                    ):
                        line = line + words[i] + " "
                        i += 1
                    if not line:
                        line = words[i]
                        i += 1
                    lines.append(line)
            return lines

        font = ImageFont.truetype(
            "Roboto-Regular.ttf",
            size=self.font_size,
        )

        if self.wrap:
            text = "\n".join(text_wrap(self.text, font, self.size[0]))
        else:
            text = self.text

        draw.text(
            text=text,
            xy=(self.width / 2, self.height / 2),
            fill=1,
            font=font,
            anchor="mm",
            spacing=0,
            align="center",
            features=None,
        )
