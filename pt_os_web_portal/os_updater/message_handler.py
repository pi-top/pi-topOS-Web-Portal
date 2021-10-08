from json import dumps as jdumps
from typing import List

from geventwebsocket.exceptions import WebSocketError
from geventwebsocket.websocket import WebSocket
from pitop.common.logger import PTLogger

from ..backend.helpers.modules import get_apt
from .types import EventNames, MessageType

(apt, apt.progress, apt_pkg) = get_apt()


class OSUpdaterFrontendMessageHandler:
    ws_clients: List[WebSocket] = []

    def _send(self, ws, message):
        failed_ws_clients = []
        for ws_client in self.ws_clients:
            try:
                ws_client.send(message)
            except WebSocketError:
                PTLogger.warning(
                    f"Request failed - removing {ws_client} from list of clients"
                )
                failed_ws_clients.append(ws_client)

        for ws_client in failed_ws_clients:
            self.ws_clients.remove(ws_client)

    def _register_client(self, ws):
        if ws not in self.ws_clients:
            PTLogger.info(f"New websocket {ws} - adding to list of clients")
            self.ws_clients.append(ws)

    def create_emit_update_sources_message(self, ws):
        def emit_update_sources_message(
            message_type: MessageType, status_message: str, percent: float
        ) -> None:
            message = status_message.strip()
            data = {
                "type": EventNames.UPDATE_SOURCES.name,
                "payload": {
                    "status": message_type.name,
                    "percent": percent,
                    "message": message,
                },
            }
            PTLogger.info(f"APT Source: {percent}% '{message}'")

            if ws:
                self._send(ws, jdumps(data))

        return emit_update_sources_message

    def create_emit_os_prepare_upgrade_message(self, ws):
        def emit_os_prepare_upgrade_message(
            message_type: MessageType, status_message: str, percent: float
        ) -> None:
            message = status_message.strip()
            data = {
                "type": EventNames.OS_PREPARE_UPGRADE.name,
                "payload": {
                    "status": message_type.name,
                    "percent": percent,
                    "message": message,
                },
            }
            PTLogger.info(f"Upgrade Prepare: {percent}% '{message}'")

            if ws:
                self._send(ws, jdumps(data))

        self._register_client(ws)
        return emit_os_prepare_upgrade_message

    def create_emit_os_upgrade_message(self, ws):
        def emit_os_upgrade_message(
            message_type: MessageType, status_message: str, percent: float
        ) -> None:
            message = status_message.strip()
            data = {
                "type": EventNames.OS_UPGRADE.name,
                "payload": {
                    "status": message_type.name,
                    "percent": percent,
                    "message": message,
                },
            }
            PTLogger.info(f"OS Upgrade: {percent}% '{message}'")

            if ws:
                self._send(ws, jdumps(data))

        self._register_client(ws)
        return emit_os_upgrade_message

    def create_emit_os_size_message(self, ws):
        def emit_os_size_message(message_type, size):
            data = {
                "type": EventNames.SIZE.name,
                "payload": {"size": size, "status": message_type.name},
            }
            PTLogger.info(f"OS upgrade size: {size}")

            if ws:
                self._send(ws, jdumps(data))

        self._register_client(ws)
        return emit_os_size_message

    def create_emit_state_message(self, ws):
        def emit_state_message(message_type, is_busy):
            clients = self.active_clients()
            data = {
                "type": EventNames.STATE.name,
                "payload": {
                    "busy": is_busy,
                    "clients": clients,
                    "status": message_type.name,
                },
            }
            PTLogger.info(f"OS Updater busy: {is_busy} - clients: {clients}")

            if not ws:
                return
            ws.send(jdumps(data))
            if clients == 0:
                self._register_client(ws)

        return emit_state_message

    def active_clients(self):
        clients = 0
        for ws_client in self.ws_clients:
            try:
                ws_client.send("ping")
                clients += 1
            except Exception as e:
                PTLogger.error(f"OSUpdaterFrontendMessageHandler.active_clients : {e}")
            except WebSocketError:
                pass
        return clients
