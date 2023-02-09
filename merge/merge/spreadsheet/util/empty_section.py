from merge.framework.spreadsheet.section import Section
from merge.spreadsheet.util.empty_group import EmptyGroup

class EmptySection(Section):
    def __init__(self, dimensions=(1, 1), column_width=None):
        self.id = None

        self.dimensions = dimensions
        self.column_width = column_width

        self.structure = []
        self.groups = []

    def set_bounds(self, vertical_offset, horizontal_offset):
        self.vertical_offset = vertical_offset
        self.horizontal_offset = horizontal_offset

    def get_dimensions(self):
        return self.dimensions

    def render(self, sheet, workbook):
        empty_group = EmptyGroup(
            self.dimensions,
            set(),
            self.column_width
        )
        empty_group.set_bounds(
            self.vertical_offset,
            self.horizontal_offset
        )

        empty_group.render(sheet, workbook)
