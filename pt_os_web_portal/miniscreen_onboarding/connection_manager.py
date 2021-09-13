from ipaddress import ip_address
from threading import Thread
from time import sleep

from pitop.common.sys_info import (
    get_ap_mode_status,
    get_internal_ip,
    is_connected_to_internet,
)

from ..event import AppEvents, post_event


class ApConnection:
    def __init__(self):
        self.ip = ""
        self.interface_name = "wlan_ap0"
        self.metadata = get_ap_mode_status()
        self.update()

    @property
    def ssid(self):
        return self.metadata.get("ssid", "")

    @property
    def passphrase(self):
        return self.metadata.get("passphrase", "")

    def update(self):
        self.metadata = get_ap_mode_status()
        try:
            self.ip = ip_address(get_internal_ip(iface=self.interface_name))
        except Exception:
            self.ip = ""


class ConnectionManager:
    def __init__(self):
        self.ap_connection = ApConnection()
        self.__thread = Thread(target=self._main, args=())
        self.__stop = False

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

            if self.ap_connected.ssid:
                post_event(AppEvents.AP_HAS_SSID, self.ap_connected.ssid)
            if self.ap_connected.passphrase:
                post_event(AppEvents.AP_HAS_PASSPHRASE, self.ap_connected.passphrase)
            if is_connected_to_internet():
                post_event(AppEvents.OS_IS_ONLINE, True)

            sleep(0.1)
