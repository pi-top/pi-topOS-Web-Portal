from datetime import date
from threading import Thread

from pitop.common.logger import PTLogger
from pitop.common.sys_info import is_connected_to_internet

from ..backend.helpers.finalise import onboarding_completed
from ..event import AppEvents, post_event
from .manager import OSUpdateManager
from .message_handler import OSUpdaterFrontendMessageHandler
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .types import MessageType


class OSUpdater:
    def __init__(self):
        self.manager = OSUpdateManager()
        self.message_handler = OSUpdaterFrontendMessageHandler()

    def start(self):
        t = Thread(target=self.prepare_os_upgrade, args=(), daemon=True)
        t.start()

    def update_sources(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event(AppEvents.OS_UPDATE_SOURCES, "started")
        callback = self.message_handler.create_emit_update_sources_message(ws)
        try:
            callback(MessageType.START, "Updating sources", 0.0)
            self.manager.update(callback)
            callback(MessageType.FINISH, "Finished updating sources", 100.0)
            post_event(AppEvents.OS_UPDATE_SOURCES, "success")
        except Exception as e:
            post_event(AppEvents.OS_UPDATE_SOURCES, "failed")
            callback(MessageType.ERROR, f"{e}", 0.0)

    def prepare_os_upgrade(self, ws=None, packages=[]):
        
        post_event(AppEvents.OS_UPDATER_PREPARE, "started")
        callback = self.message_handler.create_emit_os_prepare_upgrade_message(ws)
        try:
            callback(MessageType.START, "Preparing OS upgrade", 0.0)
            self.manager.stage_upgrade(callback, packages)

            if self.manager.cache.install_count == 0:
                self.manager.update_last_check_config()

            callback(MessageType.FINISH, "Finished preparing", 100.0)
            post_event(AppEvents.OS_UPDATER_PREPARE, "success")
        except Exception as e:
            post_event(AppEvents.OS_UPDATER_PREPARE, "failed")
            callback(MessageType.ERROR, f"{e}", 0.0)

    def prepare_web_portal(self, ws=None):
        self.prepare_os_upgrade(ws, packages=["pt-os-web-portal"])

    def os_upgrade_size(self, ws=None):
        callback = self.message_handler.create_emit_os_size_message(ws)
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

    def start_os_upgrade(self, ws=None):
        post_event(AppEvents.OS_UPDATER_UPGRADE, "started")

        callback = self.message_handler.create_emit_os_upgrade_message(ws)
        try:
            self.manager.upgrade(callback)
            self.manager.update_last_check_config()
            post_event(AppEvents.OS_UPDATER_UPGRADE, "success")
        except Exception as e:
            callback(MessageType.ERROR, f"{e}", 0.0)
            post_event(AppEvents.OS_UPDATER_UPGRADE, "failed")

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
        return self.manager.cache.install_count > 0

    def do_update_check(self, ws=None):
        do_action = self.should_check_for_updates()
        post_event(AppEvents.OS_ALREADY_CHECKED_UPDATES, do_action)

        if do_action:
            PTLogger.info("Checking for updates...")

            post_event(AppEvents.OS_HAS_UPDATES, self.updates_available())
