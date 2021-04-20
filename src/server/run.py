#!/usr/bin/python3

from os import geteuid
from argparse import ArgumentParser
from distutils.version import LooseVersion
from subprocess import Popen, PIPE

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


def package_is_installed(package_name):
    try:
        run_command(f"dpkg -s {package_name}", timeout=2)
        return True
    except Exception:
        return False


def systemd_service_is_running(package_name):
    try:
        run_command(f"systemctl is-active -q {package_name}", timeout=5)
        return True
    except Exception:
        return False


def package_version(package_name):
    try:
        stdout, stderr = Popen(f"dpkg -s {package_name} | grep Version", shell=True, stdout=PIPE).communicate()
        version_string = stdout.split()[1].decode("utf-8")
        return LooseVersion(version_string)
    except Exception as e:
        raise Exception(f"Unable to retrieve package {package_name} version: {e}")


if systemd_service_is_running("pt-os-setup") and package_is_installed("pt-os-setup") and package_version("pt-os-setup") <= LooseVersion("3.3.0"):
    PTLogger.warning("pt-os-setup is already running a webserver, exiting...")
    exit(0)

register_device_in_background()

server = pywsgi.WSGIServer(
    ("", 80),
    create_app(test=args.test_mode),
    handler_class=WebSocketHandler)
server.serve_forever()
