from signal import pause

import click

from . import OnboardingApp


@click.command()
def main() -> None:
    onboarding_app = OnboardingApp()
    onboarding_app.start()
    pause()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
