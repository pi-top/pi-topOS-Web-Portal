from pitop.common.notifications import send_notification

from .event import AppEvents, subscribe


def handle_os_has_updates_event(os_has_updates):
    if os_has_updates:
        send_notification(
            title="pi-topOS Software Updater",
            text="There are updates available for your system!\nClick the Start Menu -> System Tools -> pi-topOS Updater Tool",
            timeout=0,
            icon_name="system-software-update",
        )


def setup_notification_event_handlers():
    subscribe(AppEvents.OS_HAS_UPDATES, handle_os_has_updates_event)
