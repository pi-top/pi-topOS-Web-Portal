from .attr.speeds import DEFAULT_INTERVAL


class MenuPageBase:
    def __init__(self, type, size=(0, 0), mode=0):
        self.type = type
        self.size = size
        self.mode = mode
        self.interval = DEFAULT_INTERVAL
        self.skip = False

    def render(self, draw, redraw=False):
        raise NotImplementedError

    def should_display(self):
        return not self.skip
