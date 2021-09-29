from dataclasses import dataclass
from subprocess import check_output

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
        cmd_arr = ["/usr/bin/web-renderer"]
        if self.title:
            cmd_arr.append(f"--window-title='{self.title}'")
        if self.icon:
            cmd_arr.append(f"--icon='{self.icon}'")
        if self.hide_frame:
            cmd_arr.append("--hide-frame")
        if self.kiosk:
            cmd_arr.append("--kiosk")
        cmd_arr.append(f"--size={self.width_scalar}x{self.height_scalar}")
        cmd_arr.append(f"{self.url}")

        PTLogger.info(f"AppWindow.run: running {cmd_arr}")
        check_output(cmd_arr)
