import locale
import datetime

from copy import copy

locale.setlocale(locale.LC_NUMERIC, 'pt_BR')


class History:
    def __init__(self, francesinhas):
        self.francesinhas = francesinhas
        self.history = {}

        self.unclaimed = set()

    def build(self):
        for francesinha in self.francesinhas:
            for _, row in francesinha.body.iterrows():
                date = datetime.datetime.strptime(
                    row['data-vencimento'], '%d/%m/%Y'
                )
                date = date.strftime('%m/%Y')
                entry = (
                    row['nome'],
                    locale.atof(str(row['valor-cobrado']))
                )

                if date in self.history:
                    self.history[date].add(entry)
                else:
                    self.history[date] = {entry}

                self.unclaimed.add((date, *entry))

    def has(self, date, query_name, query_value):
        if not date in self.history:
            return False

        for name, value in self.history[date]:
            if name.strip().lower() == query_name.strip().lower():
                if value - query_value < 5:
                    key = (date, name, value)

                    if key in self.unclaimed:
                        self.unclaimed.remove(key)

                    return True

        return False
