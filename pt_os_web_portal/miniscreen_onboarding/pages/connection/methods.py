from abc import ABC, abstractmethod
from enum import Enum, auto
from getpass import getuser
from ipaddress import ip_address

from pitop.common.pt_os import is_pi_using_default_password
from pitop.common.sys_info import (
    get_address_for_ptusb_connected_device,
    get_ap_mode_status,
    get_internal_ip,
)


class ConnectionMethod(Enum):
    AP = auto()
    USB = auto()
    ETHERNET = auto()
    NONE = auto()


class ConnectionMethodBase(ABC):
    def __init__(self, connection_method, ip="", interface_name="", metadata=dict()):
        self.connection_method = connection_method
        self.ip = ip
        self.interface_name = interface_name
        self.metadata = metadata

    @abstractmethod
    def update(self):
        raise NotImplementedError

    @abstractmethod
    def is_connected(self):
        raise NotImplementedError

    def __eq__(self, other):
        return (
            isinstance(other, ConnectionMethodBase)
            and self.metadata == other.metadata
            and self.connection_method == other.connection_method
            and self.ip == other.ip
            and self.is_connected() == other.is_connected()
        )


class UsbConnection(ConnectionMethodBase):
    def __init__(self):
        super(UsbConnection, self).__init__(
            connection_method=ConnectionMethod.USB,
            ip="",
            interface_name="ptusb0",
            metadata={
                "username": "pi" if getuser() == "root" else getuser(),
                "password": "pi-top"
                if is_pi_using_default_password() is True
                else "********",
            },
        )
        self.connected_device_ip = ""
        self.update()

    def update(self):
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
            self.connected_device_ip = get_address_for_ptusb_connected_device()
        except Exception:
            self.ip = ""
            self.connected_device_ip = ""

    def is_connected(self):
        return self.connected_device_ip != ""

    def __eq__(self, other):
        return (
            isinstance(other, UsbConnection)
            and self.metadata == other.metadata
            and self.connection_method == other.connection_method
            and self.ip == other.ip
            and self.is_connected() == other.is_connected()
            and self.connected_device_ip == other.connected_device_ip
        )


class ApConnection(ConnectionMethodBase):
    def __init__(self):
        super(ApConnection, self).__init__(
            connection_method=ConnectionMethod.AP,
            ip="",
            interface_name="wlan_ap0",
            metadata=get_ap_mode_status(),
        )
        self.update()

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
            interface_name="eth0",
            metadata={
                "username": "pi" if getuser() == "root" else getuser(),
                "password": "pi-top"
                if is_pi_using_default_password() is True
                else "********",
            },
        )
        self.update()

    def update(self):
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""

    def is_connected(self):
        return self.ip != ""
