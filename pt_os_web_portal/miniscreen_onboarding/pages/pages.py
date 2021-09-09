from enum import IntEnum


class Pages(IntEnum):
    WELCOME = 0
    AP = 1
    BROWSER = 2
    CARRY_ON = 3

    def next(self):
        next_mode = self.value + 1 if self.value + 1 < len(Pages) else 0
        return Pages(next_mode)

    def previous(self):
        previous = self.value - 1 if self.value - 1 >= 0 else len(Pages) - 1
        return Pages(previous)
