import click

from .about_app_window import AboutAppWindow
from .onboarding_app_window import OnboardingAppWindow
from .os_updater_app_window import OsUpdaterAppWindow
from .tour_app_window import TourAppWindow

page_lookup = {
    "about": AboutAppWindow,
    "os-setup": OnboardingAppWindow,
    "updater": OsUpdaterAppWindow,
    "tour": TourAppWindow,
}


@click.command()
@click.argument("page_name", type=click.Choice(page_lookup.keys()))
def main(page_name):
    cls = page_lookup.get(page_name)
    cls().run()


if __name__ == "__main__":
    main(prog_name="open-web-portal-page")  # pragma: no cover
