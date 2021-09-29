from dataclasses import dataclass

from .app_window import AppWindow


@dataclass
class TourAppWindow(AppWindow):
    url: str = "http://localhost/tour"
    width_scalar: float = 0.65
    height_scalar: float = 0.7
    title: str = "pi-topOS Tour"
    icon: str = "/usr/share/icons/hicolor/scalable/apps/pt-os-about.svg"
    hide_frame: bool = True


def main():
    TourAppWindow().run()
