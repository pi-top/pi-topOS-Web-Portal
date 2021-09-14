from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.system import device_type

from .backend import create_app, onboarding_completed
from .connection_manager import ConnectionManager
from .listener_manager import ListenerManager
from .miniscreen_onboarding.onboarding_app import OnboardingApp
from .os_updater import OSUpdater


class App:
    def __init__(self, test_mode):
        self.os_updater = OSUpdater()
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
        # "start" objects that subscribe to events first
        self.os_updater.start()

        if not onboarding_completed() and device_type() == DeviceName.pi_top_4.value:
            PTLogger.info(
                "Onboarding not completed - starting miniscreen onboarding application"
            )
            OnboardingApp().start()

        self.listener_mgr.start()

        # Finally, start objects that trigger events
        self.connection_manager.start()

        self.wsgi_server.serve_forever()
