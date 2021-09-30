from .app_window import About, Onboarding, OsUpdater, Tour


class AppFactory:
    applications = {
        "about": About(),
        "os-setup": Onboarding(),
        "tour": Tour(),
        "updater": OsUpdater(),
    }

    @classmethod
    def get_app(cls, page_name: str):
        if page_name in cls.applications:
            return cls.applications.get(page_name)
        raise Exception(f"'{page_name}' is not a valid application name.")
