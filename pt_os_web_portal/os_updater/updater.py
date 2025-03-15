import logging
import subprocess
from time import sleep

from ..event import AppEvents, post_event
from .backend import OsUpdaterBackend
from .message_handler import OSUpdaterFrontendMessageHandler
from .system_clock import is_system_clock_synchronized, synchronize_system_clock
from .types import MessageType

logger = logging.getLogger(__name__)


class OSUpdater:
    def __init__(self):
        self.backend = OsUpdaterBackend()
        self.message_handler = OSUpdaterFrontendMessageHandler()

    def start(self):
        pass

    def stop(self):
        while self.backend.lock:
            logger.debug("Waiting: OS updater backend lock")
            sleep(0.2)

        logger.info("Stopped: OS updater")

    def updates_available(self):
        self.update_sources()
        self.stage_packages()
        return self.backend.install_count > 0

    def update_sources(self, ws=None):
        if not is_system_clock_synchronized():
            synchronize_system_clock()

        post_event(AppEvents.OS_UPDATE_SOURCES, "started")
        callback = self.message_handler.create_emit_update_sources_message(ws)

        def on_state_update(status_message):
            return callback(
                message_type=MessageType.STATUS,
                percent=0.0,
                status_message=status_message,
            )

        try:
            callback(MessageType.START, "Updating sources", 0.0)
            self.backend.update(on_state_update)
            callback(MessageType.FINISH, "Finished updating sources", 100.0)
            post_event(AppEvents.OS_UPDATE_SOURCES, "success")
        except Exception as e:
            logger.error(f"OSUpdater.update_sources: {e}")
            post_event(AppEvents.OS_UPDATE_SOURCES, "failed")
            callback(message_type=MessageType.ERROR, percent=0.0, status_message=f"{e}")

    def stage_packages(self, ws=None, packages=[]):
        post_event(AppEvents.OS_UPDATER_PREPARE, "started")
        callback = self.message_handler.create_emit_os_prepare_upgrade_message(ws)
        try:
            callback(MessageType.START, "Preparing OS upgrade", 0.0)
            self.backend.stage_upgrade(packages)
            callback(MessageType.FINISH, "Finished preparing", 100.0)
            post_event(AppEvents.OS_UPDATER_PREPARE, "success")
        except Exception as e:
            logger.error(f"OSUpdater.stage_packages: {e}")
            post_event(AppEvents.OS_UPDATER_PREPARE, "failed")
            callback(message_type=MessageType.ERROR, percent=0.0, status_message=f"{e}")

    def get_package_dependencies(self, package_name: str) -> list:
        cmd = f"apt-cache depends {package_name} | grep 'Depends:' | awk '{{print $2}}' | sed 's/<.*>//g' | grep -v '^$'"
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, check=True
            )
            dependencies = result.stdout.strip().split("\n")
            return [dep.strip() for dep in dependencies]
        except subprocess.CalledProcessError as e:
            logger.error(f"Error: {e}")
            return []

    def stage_web_portal(self, ws=None):
        web_portal_package = "pt-os-web-portal"
        # Stage the web portal and all its dependencies
        dependencies = self.get_package_dependencies(web_portal_package)
        packages = [web_portal_package] + dependencies
        logger.info(f"Staging pt-os-web-portal and dependencies for update: {packages}")
        self.stage_packages(ws, packages=packages)

    def upgrade_size(self, ws=None):
        callback = self.message_handler.create_emit_os_size_message(ws)
        try:
            callback(
                message_type=MessageType.STATUS,
                size={
                    "downloadSize": self.backend.download_size(),
                    "requiredSpace": self.backend.required_space(),
                },
            )
        except Exception as e:
            logger.error(f"OSUpdater.upgrade_size: {e}")
            callback(
                message_type=MessageType.ERROR,
                size={"downloadSize": 0, "requiredSpace": 0},
            )

    def start_os_upgrade(self, ws=None):
        post_event(AppEvents.OS_UPDATER_UPGRADE, "started")
        callback = self.message_handler.create_emit_os_upgrade_message(ws)

        def on_state_update(status_message):
            return callback(
                message_type=MessageType.STATUS,
                percent=0.0,
                status_message=status_message,
            )

        try:
            callback(MessageType.START, "Starting install & upgrade process", 0.0)
            self.backend.upgrade(on_state_update)
            callback(MessageType.FINISH, "Finished upgrade", 100.0)
            post_event(AppEvents.OS_UPDATER_UPGRADE, "success")
        except Exception as e:
            logger.error(f"OSUpdater.start_os_upgrade: {e}")
            callback(message_type=MessageType.ERROR, percent=0.0, status_message=f"{e}")
            post_event(AppEvents.OS_UPDATER_UPGRADE, "failed")

    def state(self, ws=None):
        callback = self.message_handler.create_emit_state_message(ws)
        try:
            callback(MessageType.STATUS, self.backend.lock)
        except Exception as e:
            logger.error(f"OSUpdater.state: {e}")
            callback(MessageType.ERROR, False)
