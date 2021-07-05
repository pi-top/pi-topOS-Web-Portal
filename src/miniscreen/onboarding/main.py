from PIL import ImageDraw
from time import sleep

from pitop import Pitop

from connection.monitor import ConnectionMonitor
from helpers import (
    draw_text,
    MARGIN_X,
    FIRST_LINE_Y,
    SECOND_LINE_Y,
    THIRD_LINE_Y,
)


miniscreen = Pitop().miniscreen
connection = ConnectionMonitor()
previous_state = None


while True:
    current_state = connection.state
    if current_state != previous_state:
        # update miniscreen with current state
        previous_state = current_state
        miniscreen.play_animated_image_file(current_state.path_to_image(),
                                            loop=current_state.is_connected() is False,
                                            background=current_state.is_connected() is False)
        if current_state.is_connected():
            image = miniscreen.image.copy()
            canvas = ImageDraw.Draw(image)
            draw_text(canvas, text=str(connection.username), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection.password), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(current_state.ip_address()), xy=(MARGIN_X, THIRD_LINE_Y),)
            miniscreen.display_image(image)
    sleep(0.5)
