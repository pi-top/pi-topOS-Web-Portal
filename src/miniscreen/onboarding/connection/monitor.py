from getpass import getuser
from ipaddress import ip_address
from threading import Thread
from time import sleep

from pitopcommon.sys_info import (
    get_internal_ip,
    get_address_for_ptusb_connected_device
)
from pitopcommon.pt_os import is_pi_using_default_password

from .state import ConnectionState


class ConnectionMonitor:
    def __init__(self):
        self.username = "pi" if getuser() == "root" else getuser()
        self.password = "pi-top" if is_pi_using_default_password() is True else "********"
        self.state = ConnectionState()
        self.stop_thread = False
        self.__update_state_thread = Thread(target=self.__update_state, args=())
        self.__update_state_thread.start()

    def __update_state(self):
        while self.stop_thread is False:
            ptusb0_ip = ""
            eth0_ip = ""
            connected_device_ip = ""
            if not self.state.ethernet_is_connected():
                try:
                    ptusb0_ip = ip_address(get_internal_ip(iface="ptusb0"))
                except ValueError:
                    pass
                connected_device_ip = get_address_for_ptusb_connected_device()

            if not self.state.usb_is_connected():
                try:
                    eth0_ip = ip_address(get_internal_ip(iface="eth0"))
                except ValueError:
                    pass

            self.state = ConnectionState(
                eth0_ip=eth0_ip,
                ptusb0_ip=ptusb0_ip,
                connected_device_ip=connected_device_ip)

            sleep(0.5)
