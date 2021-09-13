from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.system import device_type

from .backend import create_app
from .backend.helpers.finalise import onboarding_completed
from .connection_manager import ConnectionManager
from .device_registration.manager import DeviceRegistrationManager
from .listener_manager import ListenerManager
from .miniscreen_onboarding.onboarding_app import OnboardingApp
from .os_updater import OSUpdater


class App:
    def __init__(self, test_mode):
        self.os_updater = OSUpdater()
        self.device_registration_mgr = DeviceRegistrationManager()
        self.wsgi_server = WSGIServer(
            ("", 80),
            create_app(
                test_mode=test_mode,
                os_updater=self.os_updater,
            ),
            handler_class=WebSocketHandler,
        )
        self.listener_mgr = ListenerManager()
        self.connection_manager = ConnectionManager()

    def start(self):
        self.connection_manager.start()

        self.os_updater.start()

        if onboarding_completed() and not self.device_registration_mgr.is_registered():
            PTLogger.info(
                "Onboarding completed and device not yet registered - starting registration service"
            )
            self.device_registration_mgr.start()

        if not onboarding_completed() and device_type() == DeviceName.pi_top_4.value:
            PTLogger.info(
                "Onboarding not completed - starting miniscreen onboarding application"
            )
            OnboardingApp().start()

        self.listener_mgr.start()
        self.wsgi_server.serve_forever()
