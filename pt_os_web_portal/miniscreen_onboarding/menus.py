from enum import IntEnum


class Menus(IntEnum):
    WELCOME = 0
    AP = 1
    BROWSER = 2
    CARRY_ON = 3
    # USB = 2
    # ETHERNET = 3
    # INFO = 4

    def next(self):
        next_mode = self.value + 1 if self.value + 1 < len(Menus) else 0
        return Menus(next_mode)

    def previous(self):
        previous = self.value - 1 if self.value - 1 >= 0 else len(Menus) - 1
        return Menus(previous)
