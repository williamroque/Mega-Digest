from merge.framework.spreadsheet.group import Group
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.style import stylesheet


class HeaderGroup(Group):
    def __init__(self, parent_section, title, group_id, height, width):
        super().__init__(parent_section, None, group_id, [0, 0])

        self.title = title

        self.height = height
        self.width = width

    def get_dimensions(self):
        return (
            self.height,
            self.width
        )

    def query(self, _):
        return None

    def render(self, sheet, workbook):
        sheet.merge_range(
            self.vertical_offset,
            self.horizontal_offset,
            self.vertical_offset + self.height - 1,
            self.horizontal_offset + self.width - 1,
            self.title,
            workbook.add_format(
                {
                    **stylesheet['section_title'],
                    **stylesheet['n'],
                    **stylesheet['e'],
                    **stylesheet['w']
                }
            )
        )

