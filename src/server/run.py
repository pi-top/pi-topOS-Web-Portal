#!/usr/bin/python3

from os import geteuid
from argparse import ArgumentParser
from subprocess import Popen, PIPE

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from pitopcommon.logger import PTLogger
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


def is_tcp_port_in_use(port):
    try:
        process = Popen(rf"lsof -i -P -n | grep -q 'TCP \*:{port} (LISTEN)'", shell=True, stdout=PIPE)
        process.communicate()
        exit_code = process.wait()
        return exit_code == 0
    except Exception:
        return False


PT_OS_SETUP_SERVER_PORT = "8020"
if is_tcp_port_in_use(PT_OS_SETUP_SERVER_PORT):
    PTLogger.warning(f"Port {PT_OS_SETUP_SERVER_PORT} is in use, can't start pt-web-server")
    exit(0)

register_device_in_background()

server = pywsgi.WSGIServer(
    ("", 80),
    create_app(test=args.test_mode),
    handler_class=WebSocketHandler)
server.serve_forever()
