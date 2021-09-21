import state
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.common.logger import PTLogger
from pitop.system import device_type

from .backend import create_app
from .connection_manager import ConnectionManager
from .listener_manager import ListenerManager
from .miniscreen_onboarding_assistant.onboarding_assistant_app import (
    OnboardingAssistantApp,
)
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

        if (
            state.get("app", "state", fallback="onboarding") == "onboarding"
            and device_type() == DeviceName.pi_top_4.value
        ):
            PTLogger.info(
                "Onboarding not completed - starting miniscreen onboarding application"
            )
            OnboardingAssistantApp().start()

        self.listener_mgr.start()

        # Finally, start objects that trigger events
        self.connection_manager.start()

        self.wsgi_server.serve_forever()
