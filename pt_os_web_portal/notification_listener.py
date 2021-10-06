from pitop.common.notifications import send_notification

from .app_window import OsUpdaterAppWindow
from .event import AppEvents, subscribe


def handle_os_has_updates_event(os_has_updates):
    if os_has_updates:
        send_notification(
            title="pi-topOS Software Updater",
            text="There are updates available for your system!\nClick the Start Menu -> System Tools -> pi-topOS Updater Tool",
            timeout=0,
            icon_name="system-software-update",
        )


def handle_os_has_finished_update(state):
    if state == "started":
        return

    if OsUpdaterAppWindow().is_open():
        return

    if state == "failed":
        send_notification(
            title="pi-topOS Software Updater",
            text="Updates were not applied successfully!",
            timeout=0,
            icon_name="system-error",
        )

    if state == "success":
        send_notification(
            title="pi-topOS Software Updater",
            text="Updates were applied successfully!",
            timeout=0,
            icon_name="system-software-update",
        )


def setup_notification_event_handlers():
    subscribe(AppEvents.OS_HAS_UPDATES, handle_os_has_updates_event)
    subscribe(AppEvents.OS_UPDATER_UPGRADE, handle_os_has_finished_update)
