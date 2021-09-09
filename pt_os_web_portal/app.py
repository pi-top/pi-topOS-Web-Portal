from geventwebsocket.handler import WebSocketHandler
from pitop.common.command_runner import run_command
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.system import device_type
from pywsgi import WSGIServer

from .backend import create_app
from .backend.helpers.finalise import onboarding_completed
from .miniscreen_onboarding.app import OnboardingApp
from .os_updater import OSUpdater


def display_unavailable_port_notification() -> None:
    return run_command(
        "systemctl start pt-os-web-portal-port-busy", timeout=10, log_errors=False
    )


class App:
    def __init__(self, test_mode):
        self.os_updater = OSUpdater()
        self.miniscreen_onboarding = OnboardingApp()
        # self.device_registration = DeviceRegistration()
        self.wsgi_server = WSGIServer(
            ("", 80),
            create_app(
                test_mode=test_mode,
                os_updater=self.os_updater,
            ),
            handler_class=WebSocketHandler,
        )

    def start(self):
        self.os_updater.start()
        # self.device_registration.start()

        if not onboarding_completed() and device_type() == DeviceName.pi_top_4.value:
            PTLogger.info("Onboarding not completed, starting miniscreen app")
            self.miniscreen_onboarding.start()

        # register_device_in_background()

        try:
            self.wsgi_server.serve_forever()
        except OSError as e:
            PTLogger.error(f"{e}")
            if str(e.errno) == "98":
                display_unavailable_port_notification()
                exit(0)
            exit(1)
