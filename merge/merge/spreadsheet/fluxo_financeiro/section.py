from curva.framework.spreadsheet.section import Section
from curva.spreadsheet.util.header_group import HeaderGroup
from curva.spreadsheet.util.index_group import IndexGroup
from curva.spreadsheet.util.date_group import DateGroup
from curva.spreadsheet.fluxo_financeiro.value_group import ValueGroup


class FluxoFinanceiroSection(Section):
    def __init__(self, parent_sheet, inputs):
        super().__init__(
            parent_sheet,
            inputs,
            'fluxo-financeiro',
            [0, 0],
            [2, 0]
        )

        self.add_row()

        header_group = HeaderGroup(
            self,
            'Fluxo Financeiro',
            'header',
            2,
            3
        )
        self.add_group(header_group)

        self.add_row()

        tranche_list = self.inputs.get('tranche-list')
        max_tranche_length = max(
            [len(tranche.row_list) for tranche in tranche_list]
        )

        index_group = IndexGroup(
            self,
            self.inputs,
            max_tranche_length,
            ['w']
        )
        self.add_group(index_group)

        value_group = ValueGroup(
            self,
            self.inputs,
            tranche_list
        )
        self.add_group(value_group)

        date_group = DateGroup(
            self,
            self.inputs,
            max_tranche_length,
            ['e']
        )
        self.add_group(date_group)