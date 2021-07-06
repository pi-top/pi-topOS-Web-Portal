from enum import Enum, auto
from getpass import getuser
from ipaddress import ip_address
from os import path

from pitopcommon.sys_info import (
    get_address_for_ptusb_connected_device,
    get_ap_mode_status,
    get_internal_ip,
)
from pitopcommon.pt_os import is_pi_using_default_password


class ConnectionMethod(Enum):
    AP = auto()
    USB = auto()
    ETHERNET = auto()
    NONE = auto()


class ConnectionMethodBase:
    def __init__(self, connection_method):
        self.connection_method = connection_method
        self.ip = ""
        self.path_to_image = ""
        self.interface_name = ""

    def is_connected(self):
        return False

    def get_image_file_path(self, relative_file_name):
        return path.abspath(
            path.join(path.dirname(path.abspath(__file__)) + "/../images", relative_file_name)
        )

    def __eq__(self, other):
        return isinstance(other, ConnectionMethodBase) \
            and self.connection_method == other.connection_method \
            and self.ip == other.ip \
            and self.is_connected() == other.is_connected()


class NoConnection(ConnectionMethodBase):
    def __init__(self):
        self.connection_method = ConnectionMethod.NONE
        self.ip = ""
        self.path_to_image = self.get_image_file_path("first_time_connect.gif")
        self.interface_name = ""

    def is_connected(self):
        return False


class UsbConnection(ConnectionMethodBase):
    def __init__(self):
        self.connection_method = ConnectionMethod.USB
        self.username = "pi" if getuser() == "root" else getuser()
        self.password = "pi-top" if is_pi_using_default_password() is True else "********"
        self.path_to_image = self.get_image_file_path("usb.gif")
        self.interface_name = "ptusb0"

        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        return get_address_for_ptusb_connected_device() != ""


class ApConnection(ConnectionMethodBase):
    def __init__(self):
        self.connection_method = ConnectionMethod.AP
        connection_status = get_ap_mode_status()
        self.ssid = connection_status.get("ssid")
        self.passphrase = connection_status.get("passphrase")
        self.path_to_image = self.get_image_file_path("ap.gif")
        self.interface_name = "wlan_ap0"

        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        try:
            return get_ap_mode_status().get("state", "") == "active"
        except Exception:
            return False


class EthernetConnection(ConnectionMethodBase):
    def __init__(self):
        self.connection_method = ConnectionMethod.ETHERNET
        self.path_to_image = self.get_image_file_path("lan.gif")
        self.interface_name = "eth0"

        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        return self.ip != ""
