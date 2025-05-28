import logging
from concurrent.futures import ThreadPoolExecutor
from os import environ

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.common.pt_os import is_pi_top_os
from pitop.system import device_type

from pt_os_web_portal.backend.helpers.finalise import disable_ap_mode

from . import state
from .backend import create_app
from .connection_manager import ConnectionManager
from .device_registration.listener import setup_device_registration_event_handlers
from .miniscreen_onboarding_assistant.onboarding_assistant_app import (
    OnboardingAssistantApp,
)
from .os_updater import OSUpdater

logger = logging.getLogger(__name__)


class App:
    def __init__(self, test_mode):
        try:
            self.device = device_type()
        except Exception:
            self.device = ""

        self.os_updater = OSUpdater()
        self.wsgi_server = WSGIServer(
            ("", 80),
            create_app(
                test_mode=test_mode,
                os_updater=self.os_updater,
            ),
            handler_class=WebSocketHandler,
        )

        self.miniscreen_onboarding = None
        self.connection_manager = None

        if self.device == DeviceName.pi_top_4.value:
            self.connection_manager = ConnectionManager()

    def start(self):
        self.os_updater.start()

        if (
            is_pi_top_os()
            and state.get("app", "onboarded", fallback="false") == "false"
        ):
            logger.info("Onboarding not completed ...")
            if (
                self.device == DeviceName.pi_top_4.value
                and state.get("onboarding", "start_miniscreen_app", fallback="false")
                == "true"
            ):
                environ["PT_MINISCREEN_SYSTEM"] = "1"
                logger.debug("Setting ENV VAR to use miniscreen as system...")

                logger.info("Starting miniscreen onboarding application")
                self.miniscreen_onboarding = OnboardingAssistantApp()
                self.miniscreen_onboarding.start()
            else:
                logger.info("Not a pi-top[4] - disabling AP mode")
                disable_ap_mode()

        setup_device_registration_event_handlers()

        if self.connection_manager:
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
                lambda: self.connection_manager and self.connection_manager.stop(),
                stop_wsgi_server,
            ]:
                executor.submit(stop_func)
