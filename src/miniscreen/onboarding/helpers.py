from PIL import (
    Image,
    ImageFont,
    ImageSequence,
)
from time import sleep


MARGIN_X = 29
FIRST_LINE_Y = 9
SECOND_LINE_Y = 25
THIRD_LINE_Y = 41


def draw_text(canvas, text, xy, font_size=12):
    font = ImageFont.truetype("/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf", size=font_size)
    canvas.text(
        text=text,
        xy=xy,
        fill=1,
        font=font,
        anchor=None,
        spacing=0,
        align="left",
        features=None,
        font_size=font_size,
    )


def play_animated_image_file(miniscreen, image_path):
    image = Image.open(image_path)
    for frame in ImageSequence.Iterator(image):
        miniscreen.display_image(frame)
        # Wait for animated image's frame length
        sleep(float(frame.info["duration"] / 1000))
