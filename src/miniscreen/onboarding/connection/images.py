from os import path


def get_image_file_path(relative_file_name):
    return path.abspath(
        path.join(path.dirname(path.abspath(__file__)) + "/../images", relative_file_name)
    )


class ConnectionImages:
    ETHERNET_GIF_PATH = get_image_file_path("lan.gif")
    USB_GIF_PATH = get_image_file_path("usb.gif")
    CONNECT_GIF_PATH = get_image_file_path("first_time_connect.gif")
