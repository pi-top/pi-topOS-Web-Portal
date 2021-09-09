from datetime import date

from pitop.common.logger import PTLogger

from .backend.helpers.extras import FWUpdaterBreadcrumbManager
from .backend.helpers.finalise import onboarding_completed
from .backend.helpers.os_update_manager import (
    MessageType,
    OSUpdateManager,
    OSUpdaterFrontendMessageHandler,
)
from .backend.helpers.system_clock import (
    is_system_clock_synchronized,
    synchronize_system_clock,
)
from .backend.helpers.wifi_manager import is_connected_to_internet
from .event import post_event, subscribe


def setup_os_update_event_handlers():
    subscribe("os_updater_prepare_started", OSUpdateManager().update)


class OSUpdater:
    def __init__(self):
        self.manager = OSUpdateManager()
        self.message_handler = OSUpdaterFrontendMessageHandler()

    def start(self):
        self.prepare_os_upgrade()

    def prepare_os_upgrade(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event("os_updater_prepare", "started")

        callback = self.message_handler.create_emit_os_prepare_upgrade_message(ws)

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
        callback = self.message_handler.create_emit_os_size_message(ws)
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
        post_event("os_updater_upgrade", "started")

        callback = self.message_handler.create_emit_os_upgrade_message(ws)
        try:
            self.manager.upgrade(callback)
            self.manager.update_last_check_config()
            post_event("os_updater_upgrade", "success")
        except Exception as e:
            if callable(callback):
                callback(MessageType.ERROR, f"{e}", 0.0)
            post_event("os_updater_upgrade", "failed")

    def should_check_for_updates(self, ws=None):
        if not onboarding_completed():
            PTLogger.info("Onboarding not completed yet, skipping update check...")
            return False

        if not is_connected_to_internet(timeout=2):
            PTLogger.info("No internet connection detected, skipping update check...")
            return False

        return self.manager.last_checked_date != date.today()

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
