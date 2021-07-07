import atexit
from time import sleep
from threading import Thread

from .methods import (
    ConnectionMethod,
    NoConnection,
    ApConnection,
    UsbConnection,
    EthernetConnection,
)


class ConnectionMonitor:
    def __init__(self):
        self.connections = {
            ConnectionMethod.AP: ApConnection(),
            ConnectionMethod.USB: UsbConnection(),
            ConnectionMethod.ETHERNET: EthernetConnection(),
            ConnectionMethod.NONE: NoConnection(),
        }

        # initial state
        self.state = self.connections.get(ConnectionMethod.NONE)

        self.stop_thread = False
        self.__update_state_thread = Thread(target=self.__update_state, args=())
        self.__update_state_thread.start()
        atexit.register(self.stop)

    def stop(self):
        self.stop_thread = True
        if self.__update_state_thread and self.__update_state_thread.is_alive():
            self.__update_state_thread.join()

    def __update_state(self):
        while self.stop_thread is False:
            for connection_name, connection_data in self.connections.items():
                connection_data.update()
                if connection_data.is_connected():
                    self.state = connection_data
                    break

            if not self.state.is_connected():
                self.state = self.connections.get(ConnectionMethod.NONE)

            sleep(0.5)
