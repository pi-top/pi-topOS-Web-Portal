import click
from pitop.common.common_names import DeviceName
from pitop.system import device_type

from .app_factory import AppFactory


@click.command()
@click.argument(
    "page_name", type=click.Choice(AppFactory.applications.keys()), required=False
)
@click.version_option()
def main(page_name):
    if page_name is None:
        page_name = "os-setup"
        if device_type() == DeviceName.pi_top_4.value:
            page_name = "landing"

    app = AppFactory.get_app(page_name)
    app.run()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal-frontend")  # pragma: no cover
