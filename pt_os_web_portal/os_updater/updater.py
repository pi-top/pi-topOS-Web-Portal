from datetime import date, datetime
from threading import Thread

from pitop.common.logger import PTLogger
from pitop.common.sys_info import is_connected_to_internet

from ..event import AppEvents, post_event
from .manager import OSUpdateManager
from .message_handler import OSUpdaterFrontendMessageHandler
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .types import MessageType


class OSUpdater:
    def __init__(self, state_manager=None):
        self.manager = OSUpdateManager()
        self.state_manager = state_manager
        self.message_handler = OSUpdaterFrontendMessageHandler()

    def start(self):
        t = Thread(target=self.do_update_check, args=(), daemon=True)
        t.start()

    def updates_available(self, ws=None):
        self.update_sources()
        self.stage_packages()
        return self.manager.cache.install_count > 0

    @property
    def last_checked_date(self):
        return datetime.strptime(
            self.state_manager.get(
                "os_updater", "last_checked_date", fallback="2000-01-01"
            ),
            "%Y-%m-%d",
        ).date()

    def do_update_check(self, ws=None):
        should_check_for_updates = (
            self.state_manager.get("app", "state") != "onboarding"
            and is_connected_to_internet()
            and self.last_checked_date != date.today()
        )
        post_event(AppEvents.OS_ALREADY_CHECKED_UPDATES, should_check_for_updates)

        if should_check_for_updates:
            PTLogger.info("Checking for updates...")
            post_event(AppEvents.OS_HAS_UPDATES, self.updates_available())

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

    def stage_packages(self, ws=None, packages=[]):
        post_event(AppEvents.OS_UPDATER_PREPARE, "started")
        callback = self.message_handler.create_emit_os_prepare_upgrade_message(ws)
        try:
            callback(MessageType.START, "Preparing OS upgrade", 0.0)
            self.manager.stage_upgrade(callback, packages)
            self.state_manager.set(
                "os_updater",
                "last_checked_date",
                date.today().strftime("%Y-%m-%d"),
            )

            callback(MessageType.FINISH, "Finished preparing", 100.0)
            post_event(AppEvents.OS_UPDATER_PREPARE, "success")
        except Exception as e:
            post_event(AppEvents.OS_UPDATER_PREPARE, "failed")
            callback(MessageType.ERROR, f"{e}", 0.0)

    def stage_web_portal(self, ws=None):
        self.stage_packages(ws, packages=["pt-os-web-portal"])

    def upgrade_size(self, ws=None):
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
            PTLogger.info(f"upgrade_size: {e}")
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
