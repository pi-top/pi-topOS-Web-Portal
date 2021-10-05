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

    def close(self):
        try:
            run_command(f'wmctrl -c "{self.title}"', timeout=5)
        except Exception as e:
            PTLogger.error(f"Error closing '{self.title}' window: {e}")


@dataclass
class AboutAppWindow(AppWindow):
    url: str = "http://localhost/about"
    width_scalar: float = 0.28
    height_scalar: float = 0.36
    title: str = "About pi-topOS"
    icon: str = "/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg"
    hide_frame: bool = False


@dataclass
class OnboardingAppWindow(AppWindow):
    url: str = "http://localhost/onboarding"
    kiosk: bool = True


@dataclass
class OsUpdaterAppWindow(AppWindow):
    url: str = "http://localhost/updater"
    width_scalar: float = 0.7
    height_scalar: float = 0.7
    title: str = "pi-topOS Updater Tool"
    icon: str = "/usr/share/icons/Papirus/24x24/apps/system-software-update.svg"
    hide_frame: bool = True


@dataclass
class LandingAppWindow(AppWindow):
    url: str = "http://localhost/landing"
    width_scalar: float = 0.65
    height_scalar: float = 0.7
    title: str = "pi-topOS Landing"
    icon: str = "/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg"
    hide_frame: bool = True
