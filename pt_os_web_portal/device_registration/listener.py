import logging
from threading import Thread
from time import sleep

from .. import state
from ..event import AppEvents, subscribe
from .functions import device_is_registered, send_register_device_request

logger = logging.getLogger(__name__)


def register_device():
    try:
        logger.error("Waiting a minute before attempting device registration...")
        sleep(60)
        send_register_device_request()
    except Exception as e:
        logger.error(f"There was an error registering device: {e}.")


def handle_is_connected_to_internet_event(is_connected):
    if (
        is_connected
        and state.get("app", "onboarded", fallback="false") == "true"
        and not device_is_registered()
    ):
        logger.info(
            "Onboarding completed and device not yet registered - starting registration service"
        )
        t = Thread(target=register_device, args=(), daemon=True)
        t.start()


def setup_device_registration_event_handlers():
    subscribe(AppEvents.IS_CONNECTED_TO_INTERNET, handle_is_connected_to_internet_event)
