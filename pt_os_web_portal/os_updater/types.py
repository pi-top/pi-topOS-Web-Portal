from enum import Enum, auto


class MessageType(Enum):
    ERROR = auto()
    START = auto()
    STATUS = auto()
    FINISH = auto()


class EventNames(Enum):
    OS_UPGRADE = auto()
    OS_PREPARE_UPGRADE = auto()
    SIZE = auto()
