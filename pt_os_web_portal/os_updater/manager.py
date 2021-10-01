from typing import Dict, List

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

    def get_upgrade_dependencies(
        self, package: apt.Package, dependency_dict: Dict  # type: ignore
    ) -> Dict:
        """
        Returns a dictionary with the dependencies and the versions required to upgrade the given package.
        This is not a straightforward task since multiple entries of a dependency might appear in the
        dependency array if the package requires a specific version or range of versions of a dependency.
        e.g.: if package A depends on package B (>1.0, <1.5), the dependency array of A will be [B(>1.0), B(<1.5)]
        """
        for package_dependencies in package.candidate.dependencies:
            for dependency_object in package_dependencies:
                if len(dependency_object.target_versions) == 0:
                    continue
                if dependency_object.name not in dependency_dict:
                    # new dependency found - check its dependencies too
                    dependency_dict[dependency_object.name] = set(
                        dependency_object.target_versions
                    )
                    if dependency_object.name in self.cache:
                        self.get_upgrade_dependencies(
                            self.cache[dependency_object.name], dependency_dict
                        )
                else:
                    # store only the versions that comply with previous and new constraints
                    dependency_dict[dependency_object.name] = set(
                        dependency_object.target_versions
                    ) & set(dependency_dict[dependency_object.name])
        return dependency_dict

    def stage_package(self, package_name: str) -> None:
        package = self.cache.get(package_name)
        if package is None:
            PTLogger.info(f"OS Updater: invalid package '{package_name}' - skipping")
            return
        if not package.is_upgradable:
            PTLogger.info(
                f"OS Updater: package '{package_name}' has no updates - skipping"
            )
            return
        PTLogger.info(f"OS Updater: staging package '{package_name}' to be updated")

        package.mark_upgrade()
        dependency_dict = self.get_upgrade_dependencies(package, {})
        for pkg_name, versions in dependency_dict.items():
            pkg = self.cache.get(pkg_name)
            if pkg and len(versions) > 0:
                pkg.candidate = sorted([*versions], reverse=True)[0]
                if pkg.is_upgradable:
                    PTLogger.info(
                        f"OS Updater: staging upgrade for package '{pkg}' to version '{pkg.candidate.version}'"
                    )
                    pkg.mark_upgrade()

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
                    self.stage_package(package_name)

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
