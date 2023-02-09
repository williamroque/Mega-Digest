from curva.framework.spreadsheet.group import Group
from curva.framework.spreadsheet.cell import Cell
from curva.spreadsheet.util.empty_cell import EmptyCell
from curva.spreadsheet.style import stylesheet
from curva.spreadsheet.tranches.style import stylesheet as tranches_stylesheet


class ColumnGroup(Group):
    def __init__(self, parent_section, inputs, group_id, header, border=None):
        super().__init__(parent_section, inputs, group_id, [0, 0])

        self.add_row()

        cell = Cell(
            self,
            self.inputs,
            'header',
            {'text': header['title']},
            set(['tranche_column_header']),
            header['column_width'],
            {
                **stylesheet,
                **tranches_stylesheet
            }
        )
        if border:
            cell.add_class(border)
        self.add_cell(cell)

    def push_cell(self, cell):
        pass