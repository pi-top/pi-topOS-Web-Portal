from PIL import ImageDraw
from time import sleep

from pitop import Pitop

from device import Device
from helpers import (
    draw_text,
    play_animated_image_file,
    MARGIN_X,
    FIRST_LINE_Y,
    SECOND_LINE_Y,
    THIRD_LINE_Y,
)


miniscreen = Pitop().miniscreen
device = Device()
previous_state = None

while True:
    current_state = device.state
    if current_state != previous_state:
        # update miniscreen with current state
        previous_state = current_state
        play_animated_image_file(miniscreen, current_state.path_to_image())
        if current_state.is_connected():
            image = miniscreen.image.copy()
            canvas = ImageDraw.Draw(image)
            draw_text(canvas, text=str(device.username), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(device.password), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(current_state.ip_address()), xy=(MARGIN_X, THIRD_LINE_Y),)
            miniscreen.display_image(image)
    elif current_state.is_connected():
        # connection information is already displayed, sleep for a bit...
        sleep(0.5)
    else:
        # not connected, play "connect" GIF again
        play_animated_image_file(miniscreen, current_state.CONNECT_GIF_PATH)
