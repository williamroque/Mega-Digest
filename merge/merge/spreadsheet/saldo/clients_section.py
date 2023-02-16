import pandas as pd

import datetime

from merge.framework.spreadsheet.section import Section
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.saldo.header_group import HeaderGroup
from merge.spreadsheet.saldo.column_group import ColumnGroup
from merge.spreadsheet.saldo.style import stylesheet
from merge.spreadsheet.saldo.empty_group import EmptyGroup


WIDTHS = [
    10, 25, 10, 10, 10, 10, 10, 10, 28, 15, 15, 15, 15, 20, 10, 20, 20, 15, 10, 10, 20, 20, 20, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 20, 15, 15
]
ALIGN = [
    2, 1, 1, 1, 2, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2
]


class ClientsSection(Section):
    def __init__(self, parent_sheet, inputs, clients):
        super().__init__(parent_sheet, inputs, 'clients', [0, 0], [0, 0])

        self.clients = clients

        self.add_row()
        self.add_group(HeaderGroup(self, 'Dados do Contrato', 'header', 1, 40))

        self.add_row()

        client_df = pd.concat(
            [client.to_series() for client in clients],
            axis = 1
        ).T

        for j, column in enumerate(client_df):
            group = ColumnGroup(
                self,
                inputs,
                column,
                {
                    'title': column,
                    'column_width': WIDTHS[j]
                }
            )

            for i, row in enumerate(client_df[column]):
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

        history_df = pd.concat(
            [client.data['history'] for client in clients],
            axis = 1
        ).T
        history_df.sort_index(
            axis=1,
            inplace=True,
            key=lambda c: [
                datetime.datetime.strptime(str(x), '%m/%Y') for x in c
            ]
        )

        for j, column in enumerate(history_df):
            self.add_group(EmptyGroup(self, inputs, j, 15), 0)

            group = ColumnGroup(
                self,
                inputs,
                column,
                {
                    'title': column,
                    'column_width': 15
                }
            )

            for i, row in enumerate(history_df[column]):
                group.add_row()

                if isinstance(row, tuple):
                    text = row[0]
                    entry_class = 'entry_paid' if row[1] else 'entry'
                else:
                    text = '-'
                    entry_class = 'entry'

                cell = Cell(
                    self,
                    inputs,
                    f'{column}-{i}',
                    {
                        'text': text
                    },
                    set([
                        entry_class,
                        'right'
                    ]),
                    15,
                    stylesheet
                )
                group.add_cell(cell)

            self.add_group(group)
