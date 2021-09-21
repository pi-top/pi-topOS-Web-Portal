from pitop.miniscreen.oled.core.contrib.luma.core.virtual import viewport


class Viewport:
    def __init__(self, miniscreen, pages):
        self.viewport = viewport(
            miniscreen.device,
            width=miniscreen.size[0],
            height=miniscreen.size[1] * len(pages),
        )

        self.pages = pages
        self.page_index = 0

        for i, page in enumerate(self.pages):
            self.viewport.add_hotspot(page, (0, i * miniscreen.size[1]))

        self.viewport.set_position((0, self.page_index * miniscreen.size[1]))

    @property
    def y_pos(self):
        return self.viewport._position[1]

    def refresh(self):
        return self.viewport.refresh()

    def set_position(self, pos):
        return self.viewport.set_position(pos)