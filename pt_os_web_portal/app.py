import logging
from concurrent.futures import ThreadPoolExecutor

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from pitop.common.common_names import DeviceName
from pitop.system import device_type

from .backend import create_app
from .connection_manager import ConnectionManager
from .device_registration.listener import setup_device_registration_event_handlers
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

        self.connection_manager = None

        if self.device == DeviceName.pi_top_4.value:
            self.connection_manager = ConnectionManager()

    def start(self):
        self.os_updater.start()

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
                lambda: self.connection_manager and self.connection_manager.stop(),
                stop_wsgi_server,
            ]:
                executor.submit(stop_func)
