from datetime import date, datetime
from enum import Enum, auto
from threading import Thread
from time import sleep

from pitop.common.logger import PTLogger
from pitop.common.sys_info import is_connected_to_internet

from .. import state
from ..event import AppEvents, post_event
from .legacy import LegacyOSUpdateManager
from .manager import OSUpdateManager
from .message_handler import OSUpdaterFrontendMessageHandler
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .types import MessageType


class UpdaterBackend(Enum):
    PY_APT = auto()
    LEGACY = auto()


class OSUpdater:
    def __init__(self):
        self.backends = {
            UpdaterBackend.PY_APT: OSUpdateManager(),
            UpdaterBackend.LEGACY: LegacyOSUpdateManager(),
        }
        self.active_backend = self.backends[UpdaterBackend.PY_APT]
        self.message_handler = OSUpdaterFrontendMessageHandler()
        self.thread = Thread(target=self.do_update_check, args=(), daemon=True)

    def start(self):
        self.thread = Thread(target=self.do_update_check, args=(), daemon=True)
        self.thread.start()

    def stop(self):
        while self.manager.lock:
            sleep(0.2)

        if self.thread.is_alive():
            self.thread.join()

    def updates_available(self):
        self.update_sources()
        self.stage_packages()
        return self.active_backend.install_count > 0

    @property
    def last_checked_date(self):
        return datetime.strptime(
            state.get("os_updater", "last_checked_date", fallback="2000-01-01"),
            "%Y-%m-%d",
        ).date()

    def update_last_check_config(self) -> None:
        state.set(
            "os_updater", "last_checked_date", f"{date.today().strftime('%Y-%m-%d')}"
        )

    def do_update_check(self, ws=None):
        should_check_for_updates = (
            state.get("app", "onboarded", fallback="false") == "true"
            and is_connected_to_internet()
            and self.last_checked_date != date.today()
        )
        post_event(AppEvents.OS_ALREADY_CHECKED_UPDATES, should_check_for_updates)

        if should_check_for_updates:
            PTLogger.info("OSUpdater: Checking for updates...")
            post_event(AppEvents.OS_HAS_UPDATES, self.updates_available())

    def update_sources(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event(AppEvents.OS_UPDATE_SOURCES, "started")
        callback = self.message_handler.create_emit_update_sources_message(ws)
        try:
            callback(MessageType.START, "Updating sources", 0.0)
            self.active_backend.update(callback)
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
            self.active_backend.stage_upgrade(callback, packages)
            state.set(
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
                    "downloadSize": self.active_backend.download_size(),
                    "requiredSpace": self.active_backend.required_space(),
                },
            )
        except Exception as e:
            PTLogger.error(f"OSUpdater upgrade_size: {e}")
            callback(MessageType.ERROR, {"downloadSize": 0, "requiredSpace": 0})

    def start_os_upgrade(self, ws=None):
        post_event(AppEvents.OS_UPDATER_UPGRADE, "started")

        callback = self.message_handler.create_emit_os_upgrade_message(ws)
        try:
            self.active_backend.upgrade(callback)
            self.update_last_check_config()
            post_event(AppEvents.OS_UPDATER_UPGRADE, "success")
        except Exception as e:
            callback(MessageType.ERROR, f"{e}", 0.0)
            post_event(AppEvents.OS_UPDATER_UPGRADE, "failed")

    def use_legacy_backend(self, ws=None):
        PTLogger.info("OSUpdater: Using legacy backend...")
        self.active_backend = self.backends[UpdaterBackend.LEGACY]

    def use_default_backend(self, ws=None):
        PTLogger.info("OSUpdater: Using default backend...")
        self.active_backend = self.backends[UpdaterBackend.PY_APT]
