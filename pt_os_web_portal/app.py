import logging
from concurrent.futures import ThreadPoolExecutor

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.system import device_type

from . import state
from .backend import create_app
from .connection_manager import ConnectionManager
from .listener_manager import ListenerManager
from .miniscreen_onboarding_assistant.onboarding_assistant_app import (
    OnboardingAssistantApp,
)
from .os_updater import OSUpdater

logger = logging.getLogger(__name__)


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
        self.miniscreen_onboarding = None
        self.connection_manager = ConnectionManager()

    def start(self):
        self.os_updater.start()

        if (
            state.get("app", "onboarded", fallback="false") == "false"
            and device_type() == DeviceName.pi_top_4.value
        ):
            logger.info(
                "Onboarding not completed - starting miniscreen onboarding application"
            )
            self.miniscreen_onboarding = OnboardingAssistantApp()
            self.miniscreen_onboarding.start()

        self.listener_mgr.start()

        self.connection_manager.start()

        self.wsgi_server.start()

    def stop(self):
        def stop_wsgi_server():
            self.wsgi_server.stop()
            logger.info("Stopped: WSGI Server")

        # Using thread pool with context will cause it to behave
        # as if Executor.shutdown() were called with `wait=True`
        with ThreadPoolExecutor() as executor:
            for stop_func in [
                self.os_updater.stop,
                lambda: self.miniscreen_onboarding
                and self.miniscreen_onboarding.stop(),
                self.connection_manager.stop,
                stop_wsgi_server,
            ]:
                executor.submit(stop_func)
