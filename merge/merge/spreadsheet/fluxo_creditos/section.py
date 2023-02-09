from curva.framework.spreadsheet.section import Section
from curva.spreadsheet.util.header_group import HeaderGroup
from curva.spreadsheet.util.index_group import IndexGroup
from curva.spreadsheet.util.date_group import DateGroup
from curva.spreadsheet.fluxo_creditos.value_group import ValueGroup


class FluxoCreditosSection(Section):
    def __init__(self, parent_sheet, inputs):
        super().__init__(
            parent_sheet,
            inputs,
            'fluxo-creditos',
            [0, 1],
            [2, 1]
        )

        self.add_row()

        header_group = HeaderGroup(
            self,
            'Fluxo de Créditos Imobiliários',
            'header',
            2,
            3
        )
        self.add_group(header_group)

        self.add_row()

        index_group = IndexGroup(
            self,
            self.inputs,
            len(self.inputs.get('flux-months')),
            ['w']
        )
        self.add_group(index_group)

        value_group = ValueGroup(
            self,
            self.inputs
        )
        self.add_group(value_group)

        date_group = DateGroup(
            self,
            self.inputs,
            len(self.inputs.get('flux-months')),
            ['e']
        )
        self.add_group(date_group)