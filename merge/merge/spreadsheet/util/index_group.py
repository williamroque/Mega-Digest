from merge.framework.spreadsheet.group import Group
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.style import stylesheet

class IndexGroup(Group):
    def __init__(self, parent_section, inputs, length, class_list):
        super().__init__(parent_section, inputs, 'index', [0, 0])

        for i in range(len(inputs.get('flux-months')[:length])):
            self.add_row()

            cell = Cell(
                self,
                self.inputs,
                f'body_{i}',
                {
                    'text': f'={i + 1}'
                },
                set(['index', *class_list]),
                6,
                stylesheet
            )
            self.add_cell(cell)

        self.inject_style(lambda i: 's' if i == -1 else None, -1)
