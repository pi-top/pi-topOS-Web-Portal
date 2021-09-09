from pitop.common.logger import PTLogger
from pitop.common.pt_os import get_pitopOS_info
from requests import get

from ..events import MessageType
from .modules import get_apt

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


# TODO: Move/rename this for 'pi-topOS version check'
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
        "requireBurn": False,
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
