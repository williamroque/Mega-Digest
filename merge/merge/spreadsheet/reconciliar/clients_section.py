from merge.framework.spreadsheet.section import Section
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.reconciliar.header_group import HeaderGroup
from merge.spreadsheet.reconciliar.column_group import ColumnGroup
from merge.spreadsheet.reconciliar.style import stylesheet


WIDTHS = [
    10, 35, 10
]
ALIGN = [
    0, 1, 2
]
TITLES = [
    'Data', 'Nome', 'Valor'
]


class ClientsSection(Section):
    def __init__(self, parent_sheet, inputs, clients):
        super().__init__(parent_sheet, inputs, 'clients', [0, 0], [0, 0])

        self.clients = clients

        self.add_row()
        self.add_group(HeaderGroup(self, 'Dados a Reconciliar', 'header', 1, 3))

        self.add_row()

        client_columns = list(zip(*clients))

        for j, column in enumerate(client_columns):
            group = ColumnGroup(
                self,
                inputs,
                column,
                {
                    'title': TITLES[j],
                    'column_width': WIDTHS[j]
                }
            )

            for i, row in enumerate(column):
                group.add_row()

                cell = Cell(
                    self,
                    inputs,
                    f'{column}-{i}',
                    {
                        'text': row
                    },
                    set([
                        'entry',
                        ['center', 'left', 'right'][ALIGN[j]]
                    ]),
                    WIDTHS[j],
                    stylesheet
                )
                group.add_cell(cell)

            self.add_group(group)
