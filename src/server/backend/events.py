from enum import Enum, auto
from json import dumps as jdumps

from pitopcommon.logger import PTLogger


class MessageType(Enum):
    ERROR = auto()
    START = auto()
    STATUS = auto()
    FINISH = auto()


class EventNames(Enum):
    OS_UPGRADE = auto()
    OS_PREPARE_UPGRADE = auto()
    SIZE = auto()


def create_emit_os_prepare_upgrade_message(ws):
    def emit_os_prepare_upgrade_message(
        message_type: MessageType, status_message: str, percent: float
    ) -> None:
        data = {
            "type": EventNames.OS_PREPARE_UPGRADE.name,
            "payload": {
                "status": message_type.name,
                "percent": percent,
                "message": status_message.strip(),
            },
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_prepare_upgrade_message


def create_emit_os_upgrade_message(ws):
    def emit_os_upgrade_message(
        message_type: MessageType, status_message: str, percent: float
    ) -> None:
        data = {
            "type": EventNames.OS_UPGRADE.name,
            "payload": {
                "status": message_type.name,
                "percent": percent,
                "message": status_message.strip(),
            },
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_upgrade_message


def create_emit_os_size_message(ws):
    def emit_os_size_message(message_type, size):
        data = {
            "type": EventNames.SIZE.name,
            "payload": {"size": size, "status": message_type.name},
        }
        PTLogger.info(str(data))
        ws.send(jdumps(data))

    return emit_os_size_message
