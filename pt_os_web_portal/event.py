from enum import Enum, auto
from typing import Dict, List


class AppEvents(Enum):
    READY_TO_BE_A_MAKER = auto()  # bool
    OS_UPDATER_PREPARE = auto()  # 'started'/'success'/'failed'
    OS_UPDATER_UPGRADE = auto()  # 'started'/'success'/'failed'
    OS_HAS_UPDATES = auto()  # bool
    OS_ALREADY_CHECKED_UPDATES = auto()  # bool


subscribers: Dict[AppEvents, List] = dict()


def subscribe(event_type: AppEvents, fn):
    if event_type not in subscribers:
        subscribers[event_type] = []
    subscribers[event_type].append(fn)


def post_event(event_type: AppEvents, data=None):
    if event_type not in subscribers:
        return
    for fn in subscribers[event_type]:
        fn(data)
