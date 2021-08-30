from datetime import date, datetime

from backend.helpers.config_manager import ConfigManager
from backend.helpers.extras import FWUpdaterBreadcrumbManager
from backend.helpers.finalise import onboarding_completed
from backend.helpers.wifi_manager import is_connected_to_internet
from pitop.common.logger import PTLogger
from pitop.common.pt_os import get_pitopOS_info
from requests import get

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


# Global instance
os_updater = None


def get_os_updater_instance():
    global os_updater
    if os_updater is None:
        os_updater = OSUpdater()
    return os_updater


def prepare_os_upgrade(callback=None):
    if callback is None:

        def callback(type, data, percent):
            return None

    updater = get_os_updater_instance()
    try:
        if not is_system_clock_synchronized():
            synchronize_system_clock()
        callback(MessageType.START, "Preparing OS upgrade", 0.0)
        updater.update(callback)
        updater.stage_upgrade(callback)
        if updater.cache.install_count == 0:
            updater.update_last_check_config()
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
    fw_breadcrumb_manager = FWUpdaterBreadcrumbManager()
    updater = get_os_updater_instance()
    try:
        # tell firmware updater updater not to timeout
        if not fw_breadcrumb_manager.is_ready():
            PTLogger.info(
                "Creating 'extend timeout' breadcrumb for pt-firmware-updater"
            )
            fw_breadcrumb_manager.set_extend_timeout()

        updater.upgrade(callback)
        updater.update_last_check_config()
    except Exception as e:
        callback(MessageType.ERROR, f"{e}", 0.0)
    finally:
        fw_breadcrumb_manager.set_ready("pt-os-web-portal: Finished update.")
        # Tell firmware updater to no longer block on extended timeout
        if fw_breadcrumb_manager.is_extending_timeout():
            PTLogger.info(
                "Removing 'extend timeout' breadcrumb for pt-firmware-updater"
            )
            fw_breadcrumb_manager.clear_extend_timeout()


def check_relevant_os_updates():
    URL = "https://backend-test.pi-top.com/utils/v1/OS/checkUpdate"
    BUILD_INFO_TO_API_LOOKUP = {
        "build_os_version": "currentOSVersion",
        "build_commit": "buildCommit",
    }

    def build_info_query_params():
        build_info = get_pitopOS_info()
        build_info_dict = build_info.__dict__ if build_info else {}
        return {
            BUILD_INFO_TO_API_LOOKUP.get(key): value
            for key, value in build_info_dict.items()
            if value and BUILD_INFO_TO_API_LOOKUP.get(key)
        }

    url_query_dict = build_info_query_params()
    PTLogger.info(
        f"Checking if there are major OS updates - sending request to {URL} with {url_query_dict}"
    )
    data = {
        "shouldBurn": False,
        "requiredBurn": False,
        "latestOSVersion": "",
        "update": False,
    }
    try:
        response = get(URL, url_query_dict, timeout=5).json()
        PTLogger.info(f"Response was: {response}")
        for k, v in response.items():
            data.update({k: v})
    except Exception as e:
        PTLogger.warning(f"{e}")
    finally:
        return data


def updates_available(callback):
    prepare_os_upgrade()
    callback(get_os_updater_instance().cache.install_count > 0)


def should_check_for_updates():
    if not onboarding_completed():
        PTLogger.info("Onboarding not completed yet, skipping update check...")
        return False

    if not is_connected_to_internet(timeout=2):
        PTLogger.info("No internet connection detected, skipping update check...")
        return False

    try:
        last_checked_date_str = ConfigManager().get("os_updater", "last_checked_date")
        last_checked_date = datetime.strptime(last_checked_date_str, "%Y-%m-%d").date()
        should = last_checked_date != date.today()
        PTLogger.info(
            f"Should {'' if should else 'not'} check for updates, last checked date was {last_checked_date}"
        )
    except Exception:
        should = True

    return should
