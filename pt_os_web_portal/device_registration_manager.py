from threading import Thread
from time import sleep

from pitop.common.logger import PTLogger

from .backend.helpers.device_registration import (
    device_is_registered,
    send_register_device_request,
)
from .backend.helpers.finalise import onboarding_completed


class DeviceRegistrationManager:
    def __init__(self):
        pass

    def start(self):
        t = Thread(target=self._register_device, args=(), daemon=True)
        t.start()

    def _register_device(self):
        if not onboarding_completed():
            PTLogger.debug("Onboarding not completed, skipping device registration")
            return

        if device_is_registered():
            PTLogger.debug("Device already registered, skipping...")
            return

        try:
            PTLogger.debug("Waiting a minute before attempting device registration...")
            sleep(60)
            send_register_device_request()
        except Exception as e:
            PTLogger.error(f"There was an error registering device: {e}.")
