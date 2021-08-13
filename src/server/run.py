#!/usr/bin/python3

from argparse import ArgumentParser
from os import environ, geteuid
from threading import Thread

from backend import create_app
from backend.helpers.device_registration import register_device_in_background
from backend.helpers.finalise import onboarding_completed
from backend.helpers.os_updater import updates_available
from backend.helpers.wifi_manager import is_connected_to_internet
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from pitop.common.command_runner import run_command
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.common.notifications import send_notification
from pitop.common.sys_info import get_systemd_active_state, stop_systemd_service
from pitop.system import device_type

from miniscreen.onboarding.app import OnboardingApp
from server.backend.helpers.extras import FWUpdaterBreadcrumbManager

parser = ArgumentParser(description="pi-top backend server")
parser.add_argument(
    "--no-journal",
    help="Prints output to stdout instead of journal.",
    action="store_true",
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
    action="store_true",
)

args = parser.parse_args()
PTLogger.setup_logging(
    logger_name="pt-os-web-portal",
    logging_level=args.log_level,
    log_to_journal=args.no_journal is False,
)


def is_root() -> bool:
    return geteuid() == 0


def display_unavailable_port_notification() -> None:
    return run_command(
        "systemctl start pt-os-web-portal-port-busy", timeout=10, log_errors=False
    )


if not onboarding_completed() and device_type() == DeviceName.pi_top_4.value:
    PTLogger.info("Onboarding not completed, starting miniscreen app")

    if get_systemd_active_state("pt-miniscreen").lower() == "active":
        PTLogger.info("Stopping pt-miniscreen.service")
        stop_systemd_service("pt-miniscreen")

    # use miniscreen in non-locking mode
    environ["PT_MINISCREEN_SYSTEM"] = "1"
    onboarding_app = OnboardingApp()
    onboarding_app.start()

elif is_connected_to_internet(timeout=2):
    PTLogger.info("Checking for updates...")

    def notify_user_on_update_available(has_updates):
        PTLogger.info(f"{'There are' if has_updates else 'No'} updates available")
        if has_updates:
            send_notification(
                title="pi-topOS Software Updater",
                text="There are updates available for your system!\nClick the Start Menu -> System Tools -> pi-topOS Updater Tool",
                timeout=0,
                icon_name="system-software-update",
            )
        else:
            # Tell firmware updater that it can start
            FWUpdaterBreadcrumbManager().set_ready(
                "pt-os-web-portal: No updates available."
            )

    t = Thread(target=updates_available, args=(notify_user_on_update_available,))
    t.daemon = True
    t.start()


register_device_in_background()

try:
    server = pywsgi.WSGIServer(
        ("", 80), create_app(test=args.test_mode), handler_class=WebSocketHandler
    )
    server.serve_forever()
except OSError as e:
    PTLogger.error(f"{e}")
    if str(e.errno) == "98":
        display_unavailable_port_notification()
        exit(0)
    exit(1)
