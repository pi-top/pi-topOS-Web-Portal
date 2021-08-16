from pathlib import Path


class FWUpdaterBreadcrumbManager:
    def __init__(self):
        self.READY_FILE = Path(
            "/tmp/.com.pi-top.pt-os-web-portal.pt-firmware-updater.ready"
        )
        self.EXTEND_TIMEOUT_FILE = Path(
            "/tmp/.com.pi-top.pt-os-web-portal.pt-firmware-updater.extend-timeout"
        )

    def set_ready(self, reason: str = None):
        if not self.is_ready():
            self.READY_FILE.touch()
            if reason is not None:
                self.READY_FILE.write_text(reason + "\n")

    def is_ready(self):
        return self.READY_FILE.is_file()

    def set_extend_timeout(self):
        self.EXTEND_TIMEOUT_FILE.touch()

    def is_extending_timeout(self):
        return self.EXTEND_TIMEOUT_FILE.is_file()

    def clear_extend_timeout(self):
        self.EXTEND_TIMEOUT_FILE.unlink()
