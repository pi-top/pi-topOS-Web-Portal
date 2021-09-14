from pitop.common.logger import PTLogger

from ..backend.helpers.modules import get_apt
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
        self.packages_with_errors = list()

    def status_change(self, pkg, percent, status):
        PTLogger.debug(f"Progress: {percent}% - {pkg}: {status}")
        self.callback(MessageType.STATUS, f"{pkg}: {status}", percent)

    def update_interface(self):
        apt.progress.base.InstallProgress.update_interface(self)

    def error(self, pkg, errormsg):
        PTLogger.error(f"InstallProgress {pkg}: {errormsg}")
        self.packages_with_errors.append(pkg)
        # sent as MessageType.STATUS instead of MessageType.ERROR to avoid confusions,
        # since several other messages are sent after this one
        self.callback(MessageType.STATUS, f"ERROR - {pkg}: {errormsg}", 0)
        super().error(pkg, errormsg)
