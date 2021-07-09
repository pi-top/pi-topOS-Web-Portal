from PIL import (
    Image,
    ImageFont,
)


def draw_text(canvas, text, xy, font_size=12):
    font = ImageFont.truetype("/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf", size=font_size)
    canvas.text(
        text=str(text),
        xy=xy,
        fill=1,
        font=font,
        anchor=None,
        spacing=0,
        align="left",
        features=None,
        font_size=font_size,
    )


def process_image(image_to_process, size, mode):
    if image_to_process.size == size:
        image = image_to_process
        if image.mode != mode:
            image = image.convert(mode)
    else:
        image = Image.new(
            mode,
            size,
            "black"
        )
        image.paste(
            image_to_process.resize(
                size,
                resample=Image.NEAREST
            )
        )

    return image
