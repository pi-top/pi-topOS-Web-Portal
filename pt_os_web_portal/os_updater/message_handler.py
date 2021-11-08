import logging
from json import dumps as jdumps
from typing import List

from geventwebsocket.exceptions import WebSocketError
from geventwebsocket.websocket import WebSocket

from ..backend.helpers.modules import get_apt
from .types import EventNames, MessageType

logger = logging.getLogger(__name__)

(apt, apt.progress, apt_pkg) = get_apt()


class OSUpdaterFrontendMessageHandler:
    ws_clients: List[WebSocket] = []

    def _send(self, message):
        failed_ws_clients = []
        for ws_client in self.ws_clients:
            if not ws_client.closed:
                ws_client.send(message)
            else:
                failed_ws_clients.append(ws_client)

        for ws_client in failed_ws_clients:
            self.ws_clients.remove(ws_client)

    def register_client(self, ws):
        if ws not in self.ws_clients:
            logger.info(
                f"OSUpdaterFrontendMessageHandler.register_client : New websocket {ws} - adding to list of clients"
            )
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
            logger.info(f"APT Source: {percent}% '{message}'")

            self._send(jdumps(data))

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
            logger.info(f"Upgrade Prepare: {percent}% '{message}'")

            self._send(jdumps(data))

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
            logger.info(f"OS Upgrade: {percent}% '{message}'")

            self._send(jdumps(data))

        return emit_os_upgrade_message

    def create_emit_os_size_message(self, ws):
        def emit_os_size_message(message_type, size):
            data = {
                "type": EventNames.SIZE.name,
                "payload": {"size": size, "status": message_type.name},
            }
            logger.info(f"OS upgrade size: {size}")

            self._send(jdumps(data))

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
            logger.info(f"OS Updater busy: {is_busy} - clients: {clients}")

            if not ws:
                return
            ws.send(jdumps(data))
            if clients == 0:
                self.register_client(ws)

        return emit_state_message

    def active_clients(self):
        clients = 0
        for ws_client in self.ws_clients:
            try:
                ws_client.send("ping")
                clients += 1
            except WebSocketError:
                pass
            except Exception as e:
                logger.error(f"OSUpdaterFrontendMessageHandler.active_clients : {e}")
        return clients
