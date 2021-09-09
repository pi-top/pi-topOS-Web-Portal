from datetime import date, datetime

from pitop.common.logger import PTLogger

from ..backend.helpers.modules import get_apt
from ..config_manager import ConfigManager
from .types import MessageType

(apt, apt.progress, apt_pkg) = get_apt()


class FetchProgress(apt.progress.base.AcquireProgress):  # type: ignore
    def __init__(self, callback):
        apt.progress.base.AcquireProgress.__init__(self)
        self._callback = callback

    @property
    def callback(self):
        if callable(self._callback):
            return self._callback

    def pulse(self, owner):
        current_item = self.current_items + 1
        if current_item > self.total_items:
            current_item = self.total_items

        text = f"Downloading file {current_item} of {self.total_items}"
        if self.current_cps > 0:
            text = text + f" at {apt_pkg.size_to_str(self.current_cps)}/s"

        progress = (
            (self.current_bytes + self.current_items)
            / float(self.total_bytes + self.total_items)
        ) * 100.0
        self.callback(MessageType.STATUS, text, round(progress, 1))
        return apt.progress.base.AcquireProgress.pulse(self, owner)


class InstallProgress(apt.progress.base.InstallProgress):  # type: ignore
    def __init__(self, callback):
        apt.progress.base.InstallProgress.__init__(self)
        self.callback = callback

    def status_change(self, pkg, percent, status):
        PTLogger.debug(f"Progress: {percent}% - {pkg}: {status}")
        self.callback(MessageType.STATUS, f"{pkg}: {status}", percent)

    def update_interface(self):
        apt.progress.base.InstallProgress.update_interface(self)


class OSUpdateManager:
    lock = False

    def __init__(self) -> None:
        self.cache: apt.Cache  # type: ignore

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
        PTLogger.info("OS Updater: Staging packages for upgrade")
        if self.lock:
            callback(MessageType.ERROR, "OSUpdater is locked", 0.0)
            return
        self.lock = True

        try:
            self.cache.upgrade()
            self.cache.upgrade(True)

            PTLogger.info(
                f"OS Update: Will upgrade/install {self.cache.install_count} packages"
            )
            PTLogger.info(
                f"OS Update: Need to download {apt_pkg.size_to_str(self.cache.required_download)}"
            )
            PTLogger.info(
                f"OS Update: After this operation, {apt_pkg.size_to_str(self.cache.required_space)} of additional disk space will be used."
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

    @property
    def last_checked_date(self):
        last_checked_date = None

        try:
            last_checked_date_str = ConfigManager().get(
                "os_updater", "last_checked_date"
            )
            last_checked_date = datetime.strptime(
                last_checked_date_str, "%Y-%m-%d"
            ).date()
        except Exception:
            pass

        return last_checked_date

    def update_last_check_config(self) -> None:
        ConfigManager().set(
            "os_updater", "last_checked_date", f"{date.today().strftime('%Y-%m-%d')}"
        )