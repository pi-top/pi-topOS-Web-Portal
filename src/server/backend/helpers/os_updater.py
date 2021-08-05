import os
from datetime import date

from pitop.common.logger import PTLogger

from ..events import MessageType
from .modules import get_apt
from .system_clock import is_system_clock_synchronized, synchronize_system_clock

(apt, apt.progress, apt_pkg) = get_apt()


class FetchProgress(apt.progress.base.AcquireProgress):  # type: ignore
    def __init__(self, callback):
        apt.progress.base.AcquireProgress.__init__(self)
        self.callback = callback

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


class OSUpdater:
    lock = False

    def __init__(self) -> None:
        self.cache: apt.Cache  # type: ignore
        self.CONFIG_DIRECTORY = "/etc/pi-top/pt-os-updater/"
        self.LAST_CHECKED_CONFIG_FILE = self.CONFIG_DIRECTORY + "last_checked_date"

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

    def skip_os_updater_on_reboot(self) -> None:
        try:
            if not os.path.exists(self.CONFIG_DIRECTORY):
                PTLogger.info(f"Creating directory {self.CONFIG_DIRECTORY}")
                os.makedirs(self.CONFIG_DIRECTORY)

            if os.path.isfile(self.LAST_CHECKED_CONFIG_FILE):
                PTLogger.info(f"File {self.LAST_CHECKED_CONFIG_FILE} exists, removing")
                os.remove(self.LAST_CHECKED_CONFIG_FILE)

            with open(self.LAST_CHECKED_CONFIG_FILE, "a") as file:
                PTLogger.info(
                    f"Writing {self.LAST_CHECKED_CONFIG_FILE} to skip pt-os-updater on reboot"
                )
                file.write(date.today().strftime("%Y-%m-%d") + "\n")
        except Exception as e:
            PTLogger.warning(f"OSUpdater: {e}")


# Global instance
os_updater = None


def get_os_updater_instance():
    global os_updater
    if os_updater is None:
        os_updater = OSUpdater()
    return os_updater


def prepare_os_upgrade(callback):
    updater = get_os_updater_instance()
    try:
        if not is_system_clock_synchronized():
            synchronize_system_clock()
        callback(MessageType.START, "Preparing OS upgrade", 0.0)
        updater.update(callback)
        updater.stage_upgrade(callback)
        if updater.cache.install_count == 0:
            updater.skip_os_updater_on_reboot()
        callback(MessageType.FINISH, "Finished preparing", 100.0)
    except Exception as e:
        callback(MessageType.ERROR, f"{e}", 0.0)


def os_upgrade_size(callback):
    updater = get_os_updater_instance()
    try:
        callback(
            MessageType.STATUS,
            {
                "downloadSize": updater.download_size(),
                "requiredSpace": updater.required_space(),
            },
        )
    except Exception as e:
        PTLogger.info(f"os_upgrade_size: {e}")
        callback(MessageType.ERROR, {"downloadSize": 0, "requiredSpace": 0})


def start_os_upgrade(callback):
    updater = get_os_updater_instance()
    try:
        updater.upgrade(callback)
        updater.skip_os_updater_on_reboot()
    except Exception as e:
        callback(MessageType.ERROR, f"{e}", 0.0)
