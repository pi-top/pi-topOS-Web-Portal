from .app_window import (
    AboutAppWindow,
    OnboardingAppWindow,
    OsUpdaterAppWindow,
    TourAppWindow,
)


class AppFactory:
    applications = {
        "about": AboutAppWindow(),
        "os-setup": OnboardingAppWindow(),
        "tour": TourAppWindow(),
        "updater": OsUpdaterAppWindow(),
    }

    @classmethod
    def get_app(cls, page_name: str):
        if page_name in cls.applications:
            return cls.applications.get(page_name)
        raise Exception(f"'{page_name}' is not a valid application name.")
