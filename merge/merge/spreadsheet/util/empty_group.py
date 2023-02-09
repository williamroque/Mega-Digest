from curva.framework.spreadsheet.group import Group
from curva.spreadsheet.style import stylesheet


class EmptyGroup(Group):
    def __init__(self, dimensions=(1, 1), borders=set(), column_width=None):
        self.id = None

        self.dimensions = dimensions
        self.borders = borders
        self.column_width = column_width

    def set_bounds(self, vertical_offset, horizontal_offset):
        self.vertical_offset = vertical_offset
        self.horizontal_offset = horizontal_offset

    def get_dimensions(self):
        return self.dimensions

    def add_border(self, x, y, direction):
        self.sheet.write(
            self.vertical_offset + y,
            self.horizontal_offset + x,
            '',
            self.workbook.add_format(stylesheet[direction])
        )

    def render(self, sheet, workbook):
        self.sheet, self.workbook = sheet, workbook

        for y in range(self.dimensions[0]):
            if 'w' in self.borders:
                self.add_border(0, y, 'w')

            if 'e' in self.borders:
                self.add_border(self.dimensions[1] - 1, y, 'e')

        if self.column_width:
            self.sheet.set_column(
                self.horizontal_offset,
                self.horizontal_offset + self.dimensions[1],
                self.column_width
            )


