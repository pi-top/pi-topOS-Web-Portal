from abc import (
    ABC,
    abstractmethod,
)
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


class ConnectionMethodBase(ABC):
    def __init__(self, connection_method, ip="", path_to_image="", interface_name="", metadata=dict()):
        self.connection_method = connection_method
        self.ip = ip
        self.path_to_image = path_to_image
        self.interface_name = interface_name
        self.metadata = metadata

    @abstractmethod
    def update(self):
        raise NotImplementedError

    @abstractmethod
    def is_connected(self):
        raise NotImplementedError

    def get_image_file_path(self, relative_file_name):
        return path.abspath(
            path.join(path.dirname(path.abspath(__file__)) + "/../images", relative_file_name)
        )

    def __eq__(self, other):
        return isinstance(other, ConnectionMethodBase) \
            and self.metadata == other.metadata \
            and self.connection_method == other.connection_method \
            and self.ip == other.ip \
            and self.is_connected() == other.is_connected()


class NoConnection(ConnectionMethodBase):
    def __init__(self):
        super(NoConnection, self).__init__(
            connection_method=ConnectionMethod.NONE,
            path_to_image=self.get_image_file_path("first_time_connect.gif"))

    def update(self):
        pass

    def is_connected(self):
        return False


class UsbConnection(ConnectionMethodBase):
    def __init__(self):
        super(UsbConnection, self).__init__(
            connection_method=ConnectionMethod.USB,
            ip="",
            path_to_image=self.get_image_file_path("usb.gif"),
            interface_name="ptusb0",
            metadata={
                "username": "pi" if getuser() == "root" else getuser(),
                "password": "pi-top" if is_pi_using_default_password() is True else "********",
            })

    def update(self):
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        return get_address_for_ptusb_connected_device() != ""


class ApConnection(ConnectionMethodBase):
    def __init__(self):
        super(ApConnection, self).__init__(
            connection_method=ConnectionMethod.AP,
            ip="",
            path_to_image=self.get_image_file_path("ap.gif"),
            interface_name="wlan_ap0",
            metadata=get_ap_mode_status())

    def update(self):
        self.metadata = get_ap_mode_status()
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
        super(EthernetConnection, self).__init__(
            connection_method=ConnectionMethod.ETHERNET,
            ip="",
            path_to_image=self.get_image_file_path("lan.gif"),
            interface_name="eth0",
            metadata={
                "username": "pi" if getuser() == "root" else getuser(),
                "password": "pi-top" if is_pi_using_default_password() is True else "********",
            })

    def update(self):
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        return self.ip != ""
