import logging
from os import geteuid
from signal import SIGINT, SIGTERM
from sys import exit

import click
import click_logging
from gevent import signal_handler, wait

from .app import App

logger = logging.getLogger()
click_logging.basic_config(logger)

logging.getLogger("pitop").setLevel(logging.INFO)


def is_root() -> bool:
    return geteuid() == 0


def configure_interrupt_signals(app):
    def handler(*_):
        logger.info("Stopping...")
        app.stop()
        logger.debug("Stopped!")

    signal_handler(SIGINT, handler)
    signal_handler(SIGTERM, handler)


@click.command()
@click.option(
    "-t",
    "--test-mode",
    help="test mode",
    is_flag=True,
)
@click_logging.simple_verbosity_option(logger)
@click.version_option()
def main(test_mode):
    if not is_root():
        print("pi-topOS Web Portal must be run as root!")
        exit(1)

    app = App(test_mode)
    configure_interrupt_signals(app)
    app.start()
    wait()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
