from typing import List

from pitop.common.logger import PTLogger

from ..backend.helpers.modules import get_apt
from .progress import FetchProgress, InstallProgress
from .types import MessageType

(apt, apt.progress, apt_pkg) = get_apt()


class APTUpgradeException(Exception):
    def __init__(self, packages_arr: List):
        formatted_packages = "\\n  - ".join(packages_arr)
        super().__init__(
            f"Errors were encountered while processing:\\n  - {formatted_packages}"
        )


class OSUpdateManager:
    def __init__(self) -> None:
        self.cache = apt.Cache()
        self.lock = False

    @property
    def install_count(self):
        return self.cache.install_count

    def update(self, callback) -> None:
        PTLogger.info("OsUpdateManager: Updating APT sources")
        if self.lock:
            callback(MessageType.ERROR, "OsUpdateManager is locked", 0.0)
            return
        self.lock = True
        fetch_sources_progress = FetchProgress(callback)

        try:
            self.cache.update(fetch_sources_progress)
            self.cache.open(None)
        except Exception as e:
            PTLogger.error(f"OsUpdateManager Error: {e}")
            raise
        finally:
            self.lock = False

    def stage_upgrade(self, callback, packages=[]) -> None:
        PTLogger.info("OsUpdateManager: Staging packages for upgrade")
        if self.lock:
            callback(MessageType.ERROR, "OsUpdateManager is locked", 0.0)
            return
        self.lock = True

        try:
            if len(packages) == 0:
                PTLogger.info("OsUpdateManager: Staging all packages to be upgraded")
                self.cache.upgrade()
                self.cache.upgrade(True)
            else:
                for package_name in packages:
                    if self.cache.get(package_name) is None:
                        PTLogger.info(
                            f"OsUpdateManager: invalid package '{package_name}' - skipping"
                        )
                        continue
                    package = self.cache.get(package_name)
                    if package.is_upgradable:
                        PTLogger.info(
                            f"OsUpdateManager: package '{package_name}' was staged to be updated"
                        )
                        package.mark_upgrade()
                    else:
                        PTLogger.info(
                            f"OsUpdateManager: package '{package_name}' has no updates - skipping"
                        )

            PTLogger.info(
                f"OsUpdateManager: Will upgrade/install {self.cache.install_count} packages"
            )
            PTLogger.info(
                f"OsUpdateManager: Need to download {apt_pkg.size_to_str(self.cache.required_download)}"
            )
            PTLogger.info(
                f"OsUpdateManager: After this operation, {apt_pkg.size_to_str(self.cache.required_space)} of additional disk space will be used."
            )
        except Exception as e:
            PTLogger.error(f"OsUpdateManager Error: {e}")
            raise
        finally:
            self.lock = False

    def download_size(self):
        size = self.cache.required_download if self.cache else 0
        PTLogger.info(
            f"OsUpdateManager download_size: Need to download {apt_pkg.size_to_str(size)} - ({size} B)"
        )
        return size

    def required_space(self):
        size = self.cache.required_space if self.cache else 0
        PTLogger.info(
            f"OsUpdateManager required_space: {apt_pkg.size_to_str(size)} - ({size} B) needed for upgrade"
        )
        return size

    def upgrade(self, callback):
        PTLogger.info("OsUpdateManager: starting upgrade")
        if self.lock:
            callback(MessageType.ERROR, "OsUpdateManager is locked", 0.0)
            return
        self.lock = True

        fetch_packages_progress = FetchProgress(callback)
        install_progress = InstallProgress(callback)
        try:
            callback(MessageType.START, "Starting install & upgrade process", 0.0)
            self.cache.commit(fetch_packages_progress, install_progress)
            callback(MessageType.FINISH, "Finished upgrade", 100.0)
        except Exception as e:
            if len(install_progress.packages_with_errors) > 0:
                raise APTUpgradeException(install_progress.packages_with_errors)
            raise e
        finally:
            self.lock = False

        PTLogger.info("OsUpdateManager: finished upgrade")
