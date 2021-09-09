from pitop.common.logger import PTLogger

from .event import subscribe
from .extras import FWUpdaterBreadcrumbManager


def handle_os_has_updates_event(os_has_updates):
    if not os_has_updates:
        FWUpdaterBreadcrumbManager().set_ready(
            "pt-os-web-portal: No updates available."
        )


def handle_os_updater_upgrade_event(status):
    if status == "started":
        # tell firmware updater updater not to timeout
        if not FWUpdaterBreadcrumbManager().is_ready():
            PTLogger.info(
                "Creating 'extend timeout' breadcrumb for pt-firmware-updater"
            )
            FWUpdaterBreadcrumbManager().set_extend_timeout()

    if status in ["success", "failed"]:
        FWUpdaterBreadcrumbManager().set_ready("pt-os-web-portal: Finished update.")
        # Tell firmware updater to no longer block on extended timeout
        if FWUpdaterBreadcrumbManager().is_extending_timeout():
            PTLogger.info(
                "Removing 'extend timeout' breadcrumb for pt-firmware-updater"
            )
            FWUpdaterBreadcrumbManager().clear_extend_timeout()


def setup_fw_updater_event_handlers():
    subscribe("os_has_updates", handle_os_has_updates_event)
    subscribe("os_updater_upgrade", handle_os_updater_upgrade_event)
