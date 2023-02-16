from merge.framework.spreadsheet.spreadsheet import Spreadsheet
from merge.spreadsheet.saldo.clients_section import ClientsSection


class SaldoSheet(Spreadsheet):
    def __init__(self, inputs, clients):
        super().__init__(
            inputs,
            {
                'output_path': inputs.get('output-path'),
                'width': 1400,
                'height': 1000,
                'sheet_title': 'Saldo Demonstrativo'
            },
            [0, 0]
        )

        clients_section = ClientsSection(
            self,
            self.inputs,
            clients
        )
        self.add_section(clients_section)
