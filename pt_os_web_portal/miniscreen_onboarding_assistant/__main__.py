from signal import pause

import click

from . import OnboardingAssistantApp


@click.command()
@click.version_option()
def main() -> None:
    onboarding_app = OnboardingAssistantApp()
    onboarding_app.start()
    pause()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
