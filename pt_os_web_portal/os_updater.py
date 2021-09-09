from datetime import date, datetime

from pitop.common.logger import PTLogger

from ..events import MessageType
from .backend.helpers.extras import FWUpdaterBreadcrumbManager
from .config_manager import ConfigManager
from .event import post_event
from .finalise import onboarding_completed
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .wifi_manager import is_connected_to_internet


class OSUpdater:
    def __init__(self):
        # self.manager = OSUpdateManager()
        pass

    def prepare_os_upgrade(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event("os_updater_prepare_started", True)

    def os_upgrade_size(self, callback):
        try:
            callback(
                MessageType.STATUS,
                {
                    "downloadSize": self.manager.download_size(),
                    "requiredSpace": self.manager.required_space(),
                },
            )
        except Exception as e:
            PTLogger.info(f"os_upgrade_size: {e}")
            callback(MessageType.ERROR, {"downloadSize": 0, "requiredSpace": 0})

    def start_os_upgrade(self, callback):
        fw_breadcrumb_manager = FWUpdaterBreadcrumbManager()
        try:
            # tell firmware updater updater not to timeout
            if not fw_breadcrumb_manager.is_ready():
                PTLogger.info(
                    "Creating 'extend timeout' breadcrumb for pt-firmware-updater"
                )
                fw_breadcrumb_manager.set_extend_timeout()

            self.manager.upgrade(callback)
            self.manager.update_last_check_config()
        except Exception as e:
            callback(MessageType.ERROR, f"{e}", 0.0)
        finally:
            fw_breadcrumb_manager.set_ready("pt-os-web-portal: Finished update.")
            # Tell firmware updater to no longer block on extended timeout
            if fw_breadcrumb_manager.is_extending_timeout():
                PTLogger.info(
                    "Removing 'extend timeout' breadcrumb for pt-firmware-updater"
                )
                fw_breadcrumb_manager.clear_extend_timeout()

    def should_check_for_updates(self):
        if not onboarding_completed():
            PTLogger.info("Onboarding not completed yet, skipping update check...")
            return False

        if not is_connected_to_internet(timeout=2):
            PTLogger.info("No internet connection detected, skipping update check...")
            return False

        try:
            last_checked_date_str = ConfigManager().get(
                "os_updater", "last_checked_date"
            )
            last_checked_date = datetime.strptime(
                last_checked_date_str, "%Y-%m-%d"
            ).date()
            should = last_checked_date != date.today()
            PTLogger.info(
                f"Should {'' if should else 'not'} check for updates, last checked date was {last_checked_date}"
            )
        except Exception:
            should = True

        return should

    def updates_available(self):
        self.prepare_os_upgrade()
        # self.wait_for_prepare_to_finish()
        return self.manager.cache.install_count > 0

    def do_update_check(self):
        if self.should_check_for_updates():
            PTLogger.info("Checking for updates...")

            post_event("os_has_updates", self.updates_available())

        else:
            FWUpdaterBreadcrumbManager().set_ready(
                "pt-os-web-portal: Already checked for updates today."
            )
