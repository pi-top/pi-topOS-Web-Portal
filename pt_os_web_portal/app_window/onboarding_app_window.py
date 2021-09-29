from dataclasses import dataclass

from .app_window import AppWindow


@dataclass
class OnboardingAppWindow(AppWindow):
    url: str = "http://localhost/onboarding"
    kiosk: bool = True


def main():
    OnboardingAppWindow().run()
