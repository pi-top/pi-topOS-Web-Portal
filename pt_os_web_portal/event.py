from enum import Enum, auto
from typing import Callable, Dict, List


class AppEvents(Enum):
    READY_TO_BE_A_MAKER = auto()  # bool
    OS_UPDATE_SOURCES = auto()  # 'started'/'success'/'failed'
    OS_UPDATER_PREPARE = auto()  # 'started'/'success'/'failed'
    OS_UPDATER_UPGRADE = auto()  # 'started'/'success'/'failed'
    AP_HAS_SSID = auto()  # string
    AP_HAS_PASSPHRASE = auto()  # string
    HAS_CONNECTED_DEVICE = auto()  # bool
    IS_CONNECTED_TO_INTERNET = auto()  # bool
    RESTARTING_WEB_PORTAL = auto()  # bool
    USER_SKIPPED_CONNECTION_GUIDE = auto()  # bool


subscribers: Dict[AppEvents, List] = dict()


def subscribe(event_type: AppEvents, fn: Callable):
    if not callable(fn):
        return
    if event_type not in subscribers:
        subscribers[event_type] = []
    subscribers[event_type].append(fn)


def post_event(event_type: AppEvents, data=None):
    if event_type not in subscribers:
        return
    for fn in subscribers[event_type]:
        fn(data)
