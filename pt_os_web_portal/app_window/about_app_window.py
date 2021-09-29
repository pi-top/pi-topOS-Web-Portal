from dataclasses import dataclass

from .app_window import AppWindow


@dataclass
class AboutAppWindow(AppWindow):
    url: str = "http://localhost/about"
    width_scalar: float = 0.28
    height_scalar: float = 0.36
    title: str = "About pi-topOS"
    icon: str = "/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg"
    hide_frame: bool = False


def main():
    AboutAppWindow().run()
