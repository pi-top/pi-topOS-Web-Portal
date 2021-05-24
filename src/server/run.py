#!/usr/bin/python3

from os import geteuid
from os.path import isfile
from argparse import ArgumentParser

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from pitopcommon.logger import PTLogger
from pitopcommon.notifications import send_notification, NotificationActionManager

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
    USER_ACKNOWLEDGED_NOTIFICATION_BREADCRUMB = "/tmp/pt-web-portal.port-in-use.breadcrumb"

    if isfile(USER_ACKNOWLEDGED_NOTIFICATION_BREADCRUMB):
        PTLogger.debug("User already acknowledged the notification this session, skipping.")
        return

    open_kb_command = "chromium-browser --new-window --start-maximized https://knowledgebase.pi-top.com"
    action_str = f"touch {USER_ACKNOWLEDGED_NOTIFICATION_BREADCRUMB} && {open_kb_command}"

    action_manager = NotificationActionManager()
    action_manager.add_action(
        call_to_action_text="Open",
        command_str=action_str)

    send_notification(
        title="Error starting pt-web-portal",
        text="Port 80 is in use by another application but it's required to start pt-web-portal,\n"
        "please go to our Knowledge Base article to learn about why it's necessary and\n"
        "read about possible solutions to this issue.",
        icon_name="messagebox_critical",
        timeout=0,
        actions_manager=action_manager,
    )


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
    exit(1)
