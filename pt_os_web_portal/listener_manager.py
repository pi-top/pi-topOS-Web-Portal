from .device_registration.listener import setup_device_registration_event_handlers


class ListenerManager:
    def start(self):
        setup_device_registration_event_handlers()
