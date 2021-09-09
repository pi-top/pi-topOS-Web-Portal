from .event import subscribe
from .extras import FWUpdaterBreadcrumbManager


def handle_os_has_updates_event(os_has_updates):
    if not os_has_updates:
        FWUpdaterBreadcrumbManager().set_ready(
            "pt-os-web-portal: No updates available."
        )


def setup_notification_event_handlers():
    subscribe("os_has_updates", handle_os_has_updates_event)
