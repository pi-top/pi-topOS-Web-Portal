#!/usr/bin/python3

from os import geteuid
from argparse import ArgumentParser

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from pitopcommon.logger import PTLogger
from pitopcommon.notifications import send_notification, NotificationActionManager
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


def get_pid_using_port(port_number: int) -> list:
    try:
        return run_command(f"lsof -ti :{port_number}", timeout=10, log_errors=False).split()
    except Exception:
        return list()


def display_unavailable_port_notification() -> None:
    pids_using_port = " ".join(get_pid_using_port(80))
    open_kb_command = "'chromium-browser --new-window --start-maximized https://knowledgebase.pi-top.com/knowledge/pi-topos-port-80'"
    kill_cmd = f"env SUDO_ASKPASS=/usr/lib/pt-web-portal/pwdptwp.sh sudo -A kill -9 {pids_using_port}"

    action_manager = NotificationActionManager()
    action_manager.add_action(call_to_action_text=f"Kill PID {pids_using_port} & Restart", command_str=kill_cmd)
    action_manager.add_action(call_to_action_text="Retry", command_str="true")
    action_manager.add_action(call_to_action_text="Find out more", command_str=open_kb_command)
    action_manager.set_close_action(command_str=open_kb_command)

    send_notification(
        title="Error - pi-top web portal",
        text=f"Server cannot be started, port 80 is already in use by another process (PID {pids_using_port}).\n"
             "Make sure no other server software is configured to use this port and try again.",
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
