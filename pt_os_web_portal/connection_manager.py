import logging
from threading import Thread
from time import sleep

from pitop.common.sys_info import (
    get_address_for_connected_device,
    get_ap_mode_status,
    is_connected_to_internet,
)

from .event import AppEvents, post_event

logger = logging.getLogger(__name__)


class ConnectionManager:
    SLEEP_TIME = 0.5

    def __init__(self):
        self.__thread = Thread(target=self._main, args=())
        self._stop = False
        self._emmited_ap_credentials = False
        self._previous_connection_state = False
        self._previous_connected_device_ip = ""

    def start(self):
        self.__thread = Thread(target=self._main, args=())
        self.__thread.daemon = True
        self.__thread.start()

    def stop(self):
        self._stop = True
        if self.__thread and self.__thread.is_alive():
            self.__thread.join()
        logger.info("Stopped: Connection manager")

    def _main(self):
        while not self._stop:

            if not self._emmited_ap_credentials:
                ap_credentials = get_ap_mode_status()
                ssid = ap_credentials.get("ssid", "")
                passphrase = ap_credentials.get("passphrase", "")
                if ssid != "" and passphrase != "":
                    post_event(AppEvents.AP_HAS_SSID, ssid)
                    post_event(AppEvents.AP_HAS_PASSPHRASE, passphrase)
                    self._emmited_ap_credentials = True

            connected_device_ip = get_address_for_connected_device()
            if connected_device_ip != self._previous_connected_device_ip:
                post_event(AppEvents.HAS_CONNECTED_DEVICE, connected_device_ip != "")
                self._previous_connected_device_ip = connected_device_ip

            is_connected = is_connected_to_internet()
            if is_connected != self._previous_connection_state:
                post_event(AppEvents.IS_CONNECTED_TO_INTERNET, is_connected)
            self._previous_connection_state = is_connected

            sleep(self.SLEEP_TIME)
