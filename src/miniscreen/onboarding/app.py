import atexit
from PIL import ImageDraw
from multiprocessing import Process
from time import sleep

from pitop import Pitop

from .connection.methods import ConnectionMethod
from .connection.monitor import ConnectionMonitor
from .helpers import (
    FIRST_LINE_Y,
    MARGIN_X,
    SECOND_LINE_Y,
    THIRD_LINE_Y,
    draw_text,
    play_animated_image_file,
)


class OnboardingApp:
    def __init__(self):
        self.miniscreen = Pitop().miniscreen
        self.__auto_play_thread = None
        self.__stop_thread = False
        atexit.register(self.stop)

    def start(self):
        self.__auto_play_thread = Process(target=self.__run_in_background, args=())
        self.__auto_play_thread.start()

    def stop(self):
        self.__stop_thread = True
        if self.__auto_play_thread and self.__auto_play_thread.is_alive():
            self.__auto_play_thread.join()

    def play_state_animation(self, connection_state):
        if connection_state.is_connected():
            # final image shouldn't be cleared after animation finishes
            play_animated_image_file(self.miniscreen, connection_state.path_to_image)
        else:
            self.miniscreen.play_animated_image_file(connection_state.path_to_image,
                                                     loop=True,
                                                     background=True)

    def display_connection_data(self, connection_state):
        image = self.miniscreen.image.copy()
        canvas = ImageDraw.Draw(image)
        if connection_state.connection_method == ConnectionMethod.AP:
            draw_text(canvas, text=str(connection_state.ssid), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection_state.passphrase), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y),)
        elif connection_state.connection_method == ConnectionMethod.USB:
            draw_text(canvas, text=str(connection_state.username), xy=(MARGIN_X, FIRST_LINE_Y),)
            draw_text(canvas, text=str(connection_state.password), xy=(MARGIN_X, SECOND_LINE_Y),)
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, THIRD_LINE_Y),)
        elif connection_state.connection_method == ConnectionMethod.ETHERNET:
            draw_text(canvas, text=str(connection_state.ip), xy=(MARGIN_X, SECOND_LINE_Y),)
        self.miniscreen.display_image(image)

    def __run_in_background(self):
        connection = ConnectionMonitor()
        previous_state = None
        while self.__stop_thread is False:
            current_state = connection.state
            if current_state != previous_state:
                previous_state = current_state
                self.play_state_animation(current_state)
                if current_state.is_connected():
                    self.display_connection_data(current_state)
            sleep(0.5)
        self.miniscreen.stop_animated_image()


if __name__ == '__main__':
    try:
        app = OnboardingApp()
        app.start()
    except KeyboardInterrupt:
        pass
