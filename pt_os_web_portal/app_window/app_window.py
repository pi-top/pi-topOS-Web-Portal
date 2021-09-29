from dataclasses import dataclass

from pitop.common.command_runner import run_command
from pitop.common.logger import PTLogger


@dataclass
class AppWindow:
    url: str
    width_scalar: float = 1.0
    height_scalar: float = 1.0
    title: str = ""
    icon: str = ""
    hide_frame: bool = False
    kiosk: bool = False

    def run(self):
        cmd = "/usr/bin/web-renderer "
        if self.title:
            cmd += f"--window-title='{self.title}' "
        if self.icon:
            cmd += f"--icon='{self.icon}' "
        if self.hide_frame:
            cmd += "--hide-frame "
        if self.kiosk:
            cmd += "--kiosk "
        cmd += f"--size={self.width_scalar}x{self.height_scalar} "
        cmd += f"{self.url}"

        PTLogger.info(f"AppWindow.run: running {cmd}")
        run_command(f"{cmd}", check=False, timeout=None)
