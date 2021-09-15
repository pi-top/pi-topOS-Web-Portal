from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.system import device_type

from .backend import create_app
from .connection_manager import ConnectionManager
from .listener_manager import ListenerManager
from .miniscreen_onboarding.onboarding_app import OnboardingApp
from .os_updater import OSUpdater
from .state import StateManager


class App:
    def __init__(self, test_mode):
        self.state_manager = StateManager()
        self.os_updater = OSUpdater(self.state_manager)
        self.wsgi_server = WSGIServer(
            ("", 80),
            create_app(
                test_mode=test_mode,
                os_updater=self.os_updater,
                state_manager=self.state_manager,
            ),
            handler_class=WebSocketHandler,
        )
        self.listener_mgr = ListenerManager()
        self.connection_manager = ConnectionManager()

    def start(self):
        # "start" objects that subscribe to events first
        self.os_updater.start()

        if (
            self.state_manager.get("app", "state", fallback="onboarding")
            == "onboarding"
            and device_type() == DeviceName.pi_top_4.value
        ):
            PTLogger.info(
                "Onboarding not completed - starting miniscreen onboarding application"
            )
            OnboardingApp().start()

        self.listener_mgr.start()

        # Finally, start objects that trigger events
        self.connection_manager.start()

        self.wsgi_server.serve_forever()
