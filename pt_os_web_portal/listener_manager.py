from .fw_updater_listener import setup_fw_updater_event_handlers
from .notification_listener import setup_notification_event_handlers


class ListenerManager:
    def start(self):
        setup_fw_updater_event_handlers()
        setup_notification_event_handlers()
