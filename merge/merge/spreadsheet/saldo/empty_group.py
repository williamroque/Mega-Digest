from merge.framework.spreadsheet.group import Group
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.saldo.style import stylesheet


class EmptyGroup(Group):
    def __init__(self, parent_section, inputs, width, id):
        super().__init__(parent_section, inputs, id, [0, 0])

        cell = Cell(
            self,
            inputs,
            'header',
            {'text': ' '},
            set(['column_header']),
            width,
            stylesheet
        )

        self.add_row()
        self.add_cell(cell)
