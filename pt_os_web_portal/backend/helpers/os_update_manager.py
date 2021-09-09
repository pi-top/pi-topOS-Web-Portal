from datetime import date

import apt
import apt_pkg
from pitop.common.logger import PTLogger

from .backend.events import MessageType
from .backend.helpers.os_updater import FetchProgress, InstallProgress
from .config_manager import ConfigManager
from .event import subscribe


def setup_os_update_event_handlers():
    subscribe("os_updater_prepare_started", OSUpdateManager().update)


class OSUpdateManager:
    lock = False

    def __init__(self, ws=None) -> None:
        self.cache: apt.Cache  # type: ignore
        self.ws = ws

    def update(self, callback) -> None:
        PTLogger.info("OSUpdater: Updating APT sources")
        if self.lock:
            callback(MessageType.ERROR, "OSUpdater is locked", 0.0)
            return
        self.lock = True
        fetch_sources_progress = FetchProgress(callback)

        try:
            self.cache = apt.Cache()
            self.cache.update(fetch_sources_progress)
            self.cache.open(None)
        except Exception as e:
            PTLogger.error(f"OSUpdater Error: {e}")
            raise
        finally:
            self.lock = False

    def stage_upgrade(self, callback) -> None:
        PTLogger.info("OSUpdater: Stagging packages for upgrade")
        if self.lock:
            callback(MessageType.ERROR, "OSUpdater is locked", 0.0)
            return
        self.lock = True

        try:
            self.cache.upgrade()
            self.cache.upgrade(True)

            PTLogger.info(f"Will upgrade/install {self.cache.install_count} packages")
            PTLogger.info(
                f"Need to download {apt_pkg.size_to_str(self.cache.required_download)}"
            )
            PTLogger.info(
                f"After this operation, {apt_pkg.size_to_str(self.cache.required_space)} of additional disk space will be used."
            )
        except Exception as e:
            PTLogger.error(f"OSUpdater Error: {e}")
            raise
        finally:
            self.lock = False

    def download_size(self):
        size = self.cache.required_download if self.cache else 0
        PTLogger.info(
            f"download_size: Need to download {apt_pkg.size_to_str(size)} - ({size} B)"
        )
        return size

    def required_space(self):
        size = self.cache.required_space if self.cache else 0
        PTLogger.info(
            f"required_space: {apt_pkg.size_to_str(size)} - ({size} B) needed for upgrade"
        )
        return size

    def upgrade(self, callback):
        PTLogger.info("OSUpdater: starting upgrade")
        if self.lock:
            callback(MessageType.ERROR, "OSUpdater is locked", 0.0)
            return
        self.lock = True

        fetch_packages_progress = FetchProgress(callback)
        install_progress = InstallProgress(callback)
        try:
            callback(MessageType.START, "Starting install & upgrade process", 0.0)
            self.cache.commit(fetch_packages_progress, install_progress)
            callback(MessageType.FINISH, "Finished upgrade", 100.0)
        except Exception as e:
            PTLogger.error(f"OSUpdater Error: {e}")
            raise
        finally:
            self.lock = False

        PTLogger.info("OSUpdater: finished upgrade")

    def select_packages_to_upgrade(self, packages: list) -> None:
        pass

    def update_last_check_config(self) -> None:
        ConfigManager().set(
            "os_updater", "last_checked_date", f"{date.today().strftime('%Y-%m-%d')}"
        )
