from threading import Thread
from time import sleep

from pitop.common.logger import PTLogger

from .functions import device_is_registered, send_register_device_request


class DeviceRegistrationManager:
    def start(self):
        t = Thread(target=self._register_device, args=(), daemon=True)
        t.start()

    def _register_device(self):
        try:
            PTLogger.debug("Waiting a minute before attempting device registration...")
            sleep(60)
            send_register_device_request()
        except Exception as e:
            PTLogger.error(f"There was an error registering device: {e}.")

    def is_registered(self):
        return device_is_registered()
