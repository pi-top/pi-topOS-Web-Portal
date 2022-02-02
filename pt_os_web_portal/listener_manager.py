from .device_registration.listener import setup_device_registration_event_handlers
from .notification_listener import setup_notification_event_handlers


class ListenerManager:
    def start(self):
        setup_notification_event_handlers()
        setup_device_registration_event_handlers()
