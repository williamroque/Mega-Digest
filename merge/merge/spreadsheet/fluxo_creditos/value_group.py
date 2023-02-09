from curva.framework.spreadsheet.group import Group
from curva.framework.spreadsheet.cell import Cell
from curva.spreadsheet.style import stylesheet


class ValueGroup(Group):
    def __init__(self, parent_section, inputs):
        super().__init__(parent_section, inputs, 'value', [0, 0])

        for i, value in enumerate(inputs.get('flux-total')):
            self.add_row()

            cell = Cell(
                self,
                self.inputs,
                f'row_{i}',
                {
                    'text': f'={value}'
                },
                set(['fluxo']),
                11,
                stylesheet
            )
            self.add_cell(cell)

        self.inject_style(lambda i: 's' if i == -1 else None, -1)
