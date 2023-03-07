from merge.framework.spreadsheet.spreadsheet import Spreadsheet
from merge.spreadsheet.reconciliar.clients_section import ClientsSection


class ReconciliarSheet(Spreadsheet):
    def __init__(self, inputs, history, workbook):
        super().__init__(
            inputs,
            {
                'output_path': inputs.get('output-path'),
                'width': 1400,
                'height': 1000,
                'sheet_title': 'Planilha de Reconciliação'
            },
            [0, 0],
            workbook
        )

        clients_section = ClientsSection(
            self,
            self.inputs,
            list(history.unclaimed)
        )
        self.add_section(clients_section)
