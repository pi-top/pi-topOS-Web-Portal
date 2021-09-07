import click

from .app import OnboardingApp


@click.command()
def main(journal, log_level) -> None:
    onboarding_app = OnboardingApp()
    onboarding_app.start()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
