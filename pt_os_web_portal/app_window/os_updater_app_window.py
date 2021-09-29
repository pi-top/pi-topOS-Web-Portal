from dataclasses import dataclass

from .app_window import AppWindow


@dataclass
class OsUpdaterAppWindow(AppWindow):
    url: str = "http://localhost/updater"
    width_scalar: float = 0.7
    height_scalar: float = 0.7
    title: str = "pi-topOS Updater Tool"
    icon: str = "/usr/share/icons/Papirus/24x24/apps/system-software-update.svg"
    hide_frame: bool = True


def main():
    OsUpdaterAppWindow().run()
