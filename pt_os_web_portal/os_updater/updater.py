import logging
from enum import Enum, auto
from time import sleep

from ..event import AppEvents, post_event
from .legacy import LegacyOSUpdateManager
from .manager import OSUpdateManager
from .message_handler import OSUpdaterFrontendMessageHandler
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .types import MessageType

logger = logging.getLogger(__name__)


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

    def start(self):
        pass

    def stop(self):
        while self.active_backend.lock:
            # TODO: lower to debug
            logger.info("Waiting: OS updater backend lock")
            sleep(0.2)

        logger.info("Stopped: OS updater")

    def updates_available(self):
        self.update_sources()
        self.stage_packages()
        return self.active_backend.install_count > 0

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
            logger.error(f"OSUpdater upgrade_size: {e}")
            callback(MessageType.ERROR, {"downloadSize": 0, "requiredSpace": 0})

    def start_os_upgrade(self, ws=None):
        post_event(AppEvents.OS_UPDATER_UPGRADE, "started")

        callback = self.message_handler.create_emit_os_upgrade_message(ws)
        try:
            self.active_backend.upgrade(callback)
            post_event(AppEvents.OS_UPDATER_UPGRADE, "success")
        except Exception as e:
            callback(MessageType.ERROR, f"{e}", 0.0)
            post_event(AppEvents.OS_UPDATER_UPGRADE, "failed")

    def use_legacy_backend(self, ws=None):
        logger.info("OSUpdater: Using legacy backend...")
        self.active_backend = self.backends[UpdaterBackend.LEGACY]

    def use_default_backend(self, ws=None):
        logger.info("OSUpdater: Using default backend...")
        self.active_backend = self.backends[UpdaterBackend.PY_APT]

    def state(self, ws=None):
        callback = self.message_handler.create_emit_state_message(ws)
        try:
            callback(MessageType.STATUS, self.active_backend.lock)
        except Exception as e:
            logger.error(f"OSUpdater state: {e}")
            callback(MessageType.ERROR, False)
