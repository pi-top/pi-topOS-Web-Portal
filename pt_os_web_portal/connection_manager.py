from ipaddress import ip_address
from threading import Thread
from time import sleep

from pitop.common.sys_info import (
    get_address_for_connected_device,
    get_ap_mode_status,
    get_internal_ip,
    is_connected_to_internet,
)

from .event import AppEvents, post_event


class ApConnection:
    def __init__(self):
        self.ip = ""
        self.interface_name = "wlan_ap0"
        self.metadata = get_ap_mode_status()
        self._previous_metadata = None
        self._has_changes = True

    @property
    def ssid(self):
        return self.metadata.get("ssid", "")

    @property
    def passphrase(self):
        return self.metadata.get("passphrase", "")

    def has_changes(self):
        return self._has_changes

    def update(self):
        self.metadata = get_ap_mode_status()
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""
        finally:
            self._has_changes = self.metadata != self._previous_metadata
            self._previous_metadata = self.metadata


class ConnectionManager:
    def __init__(self):
        self.ap_connection = ApConnection()
        self.__thread = Thread(target=self._main, args=())
        self.__stop = False
        self._previous_connection_state = False
        self._previous_connected_device_ip = ""

    def start(self):
        self.__thread = Thread(target=self._main, args=())
        self.__thread.daemon = True
        self.__thread.start()

    def stop(self):
        self.__stop = True
        if self.__thread and self.__thread.is_alive():
            self.__thread.join()

    def _main(self):
        while True:
            self.ap_connection.update()
            if self.ap_connection.has_changes():
                post_event(AppEvents.AP_HAS_SSID, self.ap_connection.ssid)
                post_event(AppEvents.AP_HAS_PASSPHRASE, self.ap_connection.passphrase)

            connected_device_ip = get_address_for_connected_device()
            if connected_device_ip != self._previous_connected_device_ip:
                post_event(AppEvents.HAS_CONNECTED_DEVICE, True)
            self._previous_connected_device_ip = connected_device_ip

            is_connected = is_connected_to_internet()
            if is_connected != self._previous_connection_state:
                post_event(AppEvents.IS_CONNECTED_TO_INTERNET, is_connected)
            self._previous_connection_state = is_connected

            sleep(0.5)
