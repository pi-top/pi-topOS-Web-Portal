import logging
from pathlib import Path

from .event import AppEvents, subscribe

logger = logging.getLogger(__name__)


class FWUpdaterBreadcrumbManager:
    def __init__(self):
        self.READY_FILE = Path(
            "/tmp/.com.pi-top.pt-os-web-portal.pt-firmware-updater.ready"
        )
        self.EXTEND_TIMEOUT_FILE = Path(
            "/tmp/.com.pi-top.pt-os-web-portal.pt-firmware-updater.extend-timeout"
        )

    def set_ready(self, reason: str = None):
        if not self.is_ready():
            self.READY_FILE.touch()
            if reason is not None:
                self.READY_FILE.write_text(reason + "\n")

    def is_ready(self):
        return self.READY_FILE.is_file()

    def set_extend_timeout(self):
        self.EXTEND_TIMEOUT_FILE.touch()

    def is_extending_timeout(self):
        return self.EXTEND_TIMEOUT_FILE.is_file()

    def clear_extend_timeout(self):
        self.EXTEND_TIMEOUT_FILE.unlink()


def handle_os_has_updates_event(os_has_updates):
    if not os_has_updates:
        FWUpdaterBreadcrumbManager().set_ready(
            "pt-os-web-portal: No updates available."
        )


def handle_os_already_checked_updates_event(os_has_already_checked):
    if os_has_already_checked:
        FWUpdaterBreadcrumbManager().set_ready(
            "pt-os-web-portal: Already checked for updates today."
        )


def handle_os_updater_upgrade_event(status):
    if status == "started":
        # tell firmware updater updater not to timeout
        if not FWUpdaterBreadcrumbManager().is_ready():
            logger.info("Creating 'extend timeout' breadcrumb for pt-firmware-updater")
            FWUpdaterBreadcrumbManager().set_extend_timeout()

    if status in ["success", "failed"]:
        FWUpdaterBreadcrumbManager().set_ready("pt-os-web-portal: Finished update.")
        # Tell firmware updater to no longer block on extended timeout
        if FWUpdaterBreadcrumbManager().is_extending_timeout():
            logger.info("Removing 'extend timeout' breadcrumb for pt-firmware-updater")
            FWUpdaterBreadcrumbManager().clear_extend_timeout()


def setup_fw_updater_event_handlers():
    subscribe(
        AppEvents.OS_ALREADY_CHECKED_UPDATES, handle_os_already_checked_updates_event
    )
    subscribe(AppEvents.OS_HAS_UPDATES, handle_os_has_updates_event)
    subscribe(AppEvents.OS_UPDATER_UPGRADE, handle_os_updater_upgrade_event)
