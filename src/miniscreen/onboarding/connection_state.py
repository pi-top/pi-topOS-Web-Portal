from dataclasses import dataclass

from helpers import get_image_file_path


@dataclass(eq=True)
class ConnectionState:
    eth0_ip: str = ""
    ptusb0_ip: str = ""
    connected_device_ip: str = ""

    ETHERNET_GIF_PATH = get_image_file_path("lan.gif")
    USB_GIF_PATH = get_image_file_path("usb.gif")
    CONNECT_GIF_PATH = get_image_file_path("first_time_connect.gif")

    def is_connected(self):
        return self.ethernet_is_connected() or self.usb_is_connected()

    def ethernet_is_connected(self):
        return self.eth0_ip != ""

    def usb_is_connected(self):
        return self.connected_device_ip != ""

    def path_to_image(self):
        if self.usb_is_connected():
            return self.USB_GIF_PATH
        elif self.ethernet_is_connected():
            return self.ETHERNET_GIF_PATH
        return self.CONNECT_GIF_PATH

    def ip_address(self):
        return self.ptusb0_ip if self.ptusb0_ip else self.eth0_ip
