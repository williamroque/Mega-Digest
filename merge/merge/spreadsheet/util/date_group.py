from merge.framework.spreadsheet.group import Group
from merge.framework.spreadsheet.cell import Cell
from merge.spreadsheet.style import stylesheet

import datetime
import locale

locale.setlocale(locale.LC_TIME, 'pt_BR')
epoch = datetime.datetime(1899, 12, 30)


class DateGroup(Group):
    def __init__(self, parent_section, inputs, length, class_list):
        super().__init__(parent_section, inputs, 'date', [0, 0])

        dates = map(self.to_ordinal, self.inputs.get('flux-months')[:length])

        for i, date in enumerate(dates):
            self.add_row()

            cell = Cell(
                self,
                self.inputs,
                f'body_{i}',
                {
                    'text': f'={date}'
                },
                set(['date', *class_list]),
                8,
                stylesheet
            )
            self.add_cell(cell)

        self.inject_style(lambda i: 's' if i == -1 else None, -1)

    def to_ordinal(self, date):
        date = datetime.datetime.strptime(date, '%b-%y')
        return (date - epoch).days
