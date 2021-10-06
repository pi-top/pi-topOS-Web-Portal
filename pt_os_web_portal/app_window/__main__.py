import click

from .app_factory import AppFactory


@click.command()
@click.argument("page_name", type=click.Choice(AppFactory.applications.keys()))
@click.version_option()
def main(page_name):
    app = AppFactory.get_app(page_name)
    app.run()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal-frontend")  # pragma: no cover
