from merge.framework.spreadsheet.group import Group
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.saldo.style import stylesheet


class ColumnGroup(Group):
    def __init__(self, parent_section, inputs, group_id, header, border=None):
        super().__init__(parent_section, inputs, group_id, [0, 0])

        self.add_row()

        cell = Cell(
            self,
            self.inputs,
            'header',
            {'text': header['title']},
            set(['column_header']),
            header['column_width'],
            stylesheet
        )
        if border:
            cell.add_class(border)
        self.add_cell(cell)

    def push_cell(self, cell):
        pass
