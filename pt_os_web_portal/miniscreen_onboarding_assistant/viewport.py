from pitop.miniscreen.oled.core.contrib.luma.core.virtual import viewport


class Viewport:
    def __init__(self, name, miniscreen, pages):
        self.name = name
        self.viewport = viewport(
            miniscreen.device,
            width=miniscreen.size[0],
            height=miniscreen.size[1] * len(pages),
        )

        self.pages = pages
        self.page_index = 0

        for i, page in enumerate(self.pages):
            self.viewport.add_hotspot(page, (0, i * miniscreen.size[1]))

    @property
    def current_page(self):
        return self.pages[self.page_index]

    @property
    def y_pos(self):
        return self.viewport._position[1]

    @y_pos.setter
    def y_pos(self, pos):
        return self.viewport.set_position((0, pos))

    def refresh(self):
        return self.viewport.refresh()

    def move_to_page(self, index):
        self.page_index = index
        self.y_pos = self.page_index * self.viewport.height
