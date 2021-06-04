#!/usr/bin/python3

from os import geteuid
from argparse import ArgumentParser

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from pitopcommon.logger import PTLogger
from pitopcommon.command_runner import run_command

from backend import create_app
from backend.helpers.device_registration import register_device_in_background


parser = ArgumentParser(description="pi-top backend server")
parser.add_argument(
    "--no-journal",
    help="Prints output to stdout instead of journal.",
    action="store_true"
)
parser.add_argument(
    "--log-level",
    type=int,
    help="Set the logging level from 10 (more verbose) to 50 (less verbose).",
    default=20,
)
parser.add_argument(
    "--test-mode",
    help="Runs in test mode, mocking versions of system libraries.",
    action="store_true"
)

args = parser.parse_args()
PTLogger.setup_logging(logger_name="pt-web-portal",
                       logging_level=args.log_level, log_to_journal=args.no_journal is False)


def is_root() -> bool:
    return geteuid() == 0


def display_unavailable_port_notification() -> None:
    return run_command("systemctl start pt-web-portal-port-busy", timeout=10, log_errors=False)


register_device_in_background()

try:
    server = pywsgi.WSGIServer(
        ("", 80),
        create_app(test=args.test_mode),
        handler_class=WebSocketHandler)
    server.serve_forever()
except OSError as e:
    PTLogger.error(f"{e}")
    if str(e.errno) == "98":
        display_unavailable_port_notification()
        exit(0)
    exit(1)
