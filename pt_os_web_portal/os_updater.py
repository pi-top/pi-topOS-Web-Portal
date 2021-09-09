from datetime import date, datetime
from enum import Enum, auto
from json import dumps as jdumps

from pitop.common.logger import PTLogger

from .backend.helpers.extras import FWUpdaterBreadcrumbManager
from .backend.helpers.os_update_manager import OSUpdateManager
from .config_manager import ConfigManager
from .event import post_event
from .finalise import onboarding_completed
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .wifi_manager import is_connected_to_internet


class MessageType(Enum):
    ERROR = auto()
    START = auto()
    STATUS = auto()
    FINISH = auto()


class EventNames(Enum):
    OS_UPGRADE = auto()
    OS_PREPARE_UPGRADE = auto()
    SIZE = auto()


def create_emit_os_prepare_upgrade_message(ws):
    def emit_os_prepare_upgrade_message(
        message_type: MessageType, status_message: str, percent: float
    ) -> None:
        data = {
            "type": EventNames.OS_PREPARE_UPGRADE.name,
            "payload": {
                "status": message_type.name,
                "percent": percent,
                "message": status_message.strip(),
            },
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_prepare_upgrade_message


def create_emit_os_upgrade_message(ws):
    def emit_os_upgrade_message(
        message_type: MessageType, status_message: str, percent: float
    ) -> None:
        data = {
            "type": EventNames.OS_UPGRADE.name,
            "payload": {
                "status": message_type.name,
                "percent": percent,
                "message": status_message.strip(),
            },
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_upgrade_message


def create_emit_os_size_message(ws):
    def emit_os_size_message(message_type, size):
        data = {
            "type": EventNames.SIZE.name,
            "payload": {"size": size, "status": message_type.name},
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_size_message


class OSUpdater:
    def __init__(self):
        self.manager = OSUpdateManager()
        pass

    def prepare_os_upgrade(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event("os_updater_prepare", "started")

        callback = create_emit_os_prepare_upgrade_message(ws) if ws else None
        try:
            if callable(callback):
                callback(MessageType.START, "Preparing OS upgrade", 0.0)

            self.manager.update(callback)
            self.manager.stage_upgrade(callback)

            if self.manager.cache.install_count == 0:
                self.manager.update_last_check_config()

            if callable(callback):
                callback(MessageType.FINISH, "Finished preparing", 100.0)

            post_event("os_updater_prepare", "success")
        except Exception as e:
            post_event("os_updater_prepare", "failed")

            if callable(callback):
                callback(MessageType.ERROR, f"{e}", 0.0)

    def os_upgrade_size(self, ws=None):
        callback = create_emit_os_size_message(ws) if ws else None
        try:
            if callable(callback):
                callback(
                    MessageType.STATUS,
                    {
                        "downloadSize": self.manager.download_size(),
                        "requiredSpace": self.manager.required_space(),
                    },
                )
        except Exception as e:
            PTLogger.info(f"os_upgrade_size: {e}")
            if callable(callback):
                callback(MessageType.ERROR, {"downloadSize": 0, "requiredSpace": 0})

    def start_os_upgrade(self, ws=None):
        fw_breadcrumb_manager = FWUpdaterBreadcrumbManager()
        callback = create_emit_os_upgrade_message(ws) if ws else None
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
            if callable(callback):
                callback(MessageType.ERROR, f"{e}", 0.0)
        finally:
            fw_breadcrumb_manager.set_ready("pt-os-web-portal: Finished update.")
            # Tell firmware updater to no longer block on extended timeout
            if fw_breadcrumb_manager.is_extending_timeout():
                PTLogger.info(
                    "Removing 'extend timeout' breadcrumb for pt-firmware-updater"
                )
                fw_breadcrumb_manager.clear_extend_timeout()

    def should_check_for_updates(self, ws=None):
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

    def updates_available(self, ws=None):
        self.prepare_os_upgrade()
        # self.wait_for_prepare_to_finish()
        return self.manager.cache.install_count > 0

    def do_update_check(self, ws=None):
        if self.should_check_for_updates():
            PTLogger.info("Checking for updates...")

            post_event("os_has_updates", self.updates_available())

        else:
            FWUpdaterBreadcrumbManager().set_ready(
                "pt-os-web-portal: Already checked for updates today."
            )
