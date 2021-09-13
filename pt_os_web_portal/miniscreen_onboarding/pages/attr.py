from enum import Enum


class RenderState(Enum):
    STATIONARY = 0
    ANIMATING = 1
    DISPLAYING_INFO = 2


# Tunings to approximately match other sys info pages using GIFs
ANIMATION_SLEEP_INTERVAL = 0.02
DEFAULT_INTERVAL = 1
