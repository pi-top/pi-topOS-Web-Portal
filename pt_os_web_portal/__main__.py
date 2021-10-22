from os import geteuid
from signal import SIGINT, SIGTERM
from sys import exit

import click
from gevent import signal_handler, wait
from pitop.common.logger import PTLogger

from .app import App


def is_root() -> bool:
    return geteuid() == 0


def configure_interrupt_signals(app):
    def handler(*_):
        PTLogger.info("Stopping...")
        app.stop()
        PTLogger.debug("Stopped!")

    signal_handler(SIGINT, handler)
    signal_handler(SIGTERM, handler)


@click.command()
@click.option(
    "--log-level",
    type=int,
    help="set logging level from 10 (more verbose) to 50 (less verbose)",
    default=20,
    show_default=True,
)
@click.option(
    "-t",
    "--test-mode",
    help="test mode",
    is_flag=True,
)
@click.version_option()
def main(test_mode, log_level):
    if not is_root():
        print("pi-topOS Web Portal must be run as root!")
        exit(1)

    PTLogger.setup_logging(logger_name="pt-os-web-portal", logging_level=log_level)

    app = App(test_mode)
    configure_interrupt_signals(app)
    app.start()
    wait()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
