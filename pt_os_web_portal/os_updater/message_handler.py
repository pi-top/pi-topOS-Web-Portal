from json import dumps as jdumps

from pitop.common.logger import PTLogger

from ..backend.helpers.modules import get_apt
from .types import EventNames, MessageType

(apt, apt.progress, apt_pkg) = get_apt()


class OSUpdaterFrontendMessageHandler:
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
                ws.send(jdumps(data))

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
                ws.send(jdumps(data))

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
                ws.send(jdumps(data))

        return emit_os_upgrade_message

    def create_emit_os_size_message(self, ws):
        def emit_os_size_message(message_type, size):
            data = {
                "type": EventNames.SIZE.name,
                "payload": {"size": size, "status": message_type.name},
            }
            PTLogger.info(f"OS upgrade size: {size}")
            if ws:
                ws.send(jdumps(data))

        return emit_os_size_message
