from os import geteuid
from signal import SIGINT, SIGTERM, pause, signal
from sys import exit

import click
from pitop.common.logger import PTLogger

from .app import App


def is_root() -> bool:
    return geteuid() == 0


def configure_interrupt_signals(app):
    def signal_handler(signal, frame):
        PTLogger.info("Stopping...")
        app.stop()
        PTLogger.debug("Stopped!")

    signal(SIGINT, signal_handler)
    signal(SIGTERM, signal_handler)


@click.command()
@click.option(
    "--log-level",
    type=int,
    help="set logging level from 10 (more verbose) to 50 (less verbose)",
    default=20,
    show_default=True,
)
@click.option("--test-mode")
@click.version_option()
def main(test_mode, log_level):
    if not is_root():
        print("This script must be run as root!")
        exit(1)

    PTLogger.setup_logging(logger_name="pt-os-web-portal", logging_level=log_level)

    app = App(test_mode)
    configure_interrupt_signals(app)
    app.start()
    pause()


if __name__ == "__main__":
    main(prog_name="pt-os-web-portal")  # pragma: no cover
