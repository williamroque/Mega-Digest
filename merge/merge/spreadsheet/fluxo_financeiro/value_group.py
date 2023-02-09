from curva.framework.spreadsheet.group import Group
from curva.framework.spreadsheet.cell import Cell
from curva.spreadsheet.style import stylesheet


class ValueGroup(Group):
    def __init__(self, parent_section, inputs, tranche_list):
        super().__init__(parent_section, inputs, 'value', [0, 0])

        self.create_cell({
            'text': '=-@0',
            'references': [
                {
                    'path': ['prelude', 'valor-total', 0],
                    'static': True
                }
            ]
        }, 'total')

        row_offset = 1

        for i in range(self.inputs.get('c-period')):
            self.create_cell({
                'text': '=0'
            }, f'carencia_{i}', set(['null']))
            row_offset += 1

        max_tranche_length = max(
            [len(tranche.row_list) for tranche in tranche_list]
        )
        for i in range(max_tranche_length - row_offset):
            row_i = i + row_offset

            text = ''
            references = []
            for tranche_i, tranche in enumerate(tranche_list):
                if row_i < len(tranche.row_list):
                    text += f'+@{tranche_i * 2}+@{tranche_i * 2 + 1}'
                    references.append({
                        'path': [tranche.id, 'juros', f'row_{row_i}'],
                        'static': False
                    })
                    references.append({
                        'path': [tranche.id, 'amort', f'row_{row_i}'],
                        'static': False
                    })

            self.create_cell({
                'text': f'={text[1:]}',
                'references': references
            }, f'row_{row_i}')

        self.inject_style(lambda i: 's' if i == -1 else None, -1)

    def create_cell(self, content, cell_id, style=set(['fluxo'])):
        self.add_row()

        cell = Cell(
            self,
            self.inputs,
            cell_id,
            content,
            style,
            13,
            stylesheet
        )
        self.add_cell(cell)
