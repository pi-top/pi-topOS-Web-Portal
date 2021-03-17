#!/usr/bin/python3

from os import geteuid
from argparse import ArgumentParser

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from pitopcommon.logger import PTLogger
from onboarding import create_app


parser = ArgumentParser(description="pi-top onboarding backend server")
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
PTLogger.setup_logging(logger_name="pt-os-setup",
                       logging_level=args.log_level, log_to_journal=args.no_journal is False)


def is_root() -> bool:
    return geteuid() == 0


server = pywsgi.WSGIServer(
    ("", 8020),
    create_app(test=args.test_mode),
    handler_class=WebSocketHandler)
server.serve_forever()
