class Section():
    def __init__(self, parent_sheet, inputs, section_id, margin, default_offset):
        self.parent_sheet = parent_sheet
        self.inputs = inputs

        self.id = section_id
        self.margin = margin
        self.default_offset = default_offset

        self.groups = []
        self.structure = []

    def add_row(self):
        self.structure.append([])

    def add_group(self, group):
        self.groups.append(group)
        self.structure[-1].append(group)

    def query(self, group_id):
        search_generator = (
            group for group in self.groups if group.id == group_id)
        try:
            return next(search_generator)
        except StopIteration:
            return None

    def set_bounds(self, vertical_offset, horizontal_offset):
        self.vertical_offset = vertical_offset + self.default_offset[0]
        self.horizontal_offset = horizontal_offset + self.default_offset[1]

        group_vertical_offset = self.vertical_offset

        for row in self.structure:
            max_row_height = 0
            group_horizontal_offset = self.horizontal_offset

            for group in row:
                group.set_bounds(group_vertical_offset,
                                 group_horizontal_offset)

                height, width = group.get_dimensions()
                max_row_height = max(max_row_height, height)
                group_horizontal_offset += width

            group_vertical_offset += max_row_height

    def get_dimensions(self):
        max_vertical = 0
        max_horizontal = 0

        for row in self.structure:
            max_vertical_row = 0
            horizontal_offset_row = 0

            for group in row:
                group_v, group_h = group.get_dimensions()
                if group_v > 0:
                    max_vertical_row = group_v
                horizontal_offset_row += group_h

            if max_vertical_row > max_vertical:
                max_vertical = max_vertical

            if horizontal_offset_row > max_horizontal:
                max_horizontal = horizontal_offset_row

        return (
            max_vertical + self.margin[0],
            max_horizontal + self.margin[1]
        )

    def render(self, sheet, workbook):
        for group in self.groups:
            group.render(sheet, workbook)
