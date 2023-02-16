import re

import pandas as pd


def search_address(string):
    search = re.search(
        r'(.*?),?\s*(?:(,\s*)\d+|No\.\s*(\d+))',
        string
    )

    if search:
        return search.groups()

    return string, '-'


class Extrato():
    def __init__(self, path):
        self.frame = pd.read_excel(path, engine='xlrd')
        self.header = self.parse_header()
        self.body = self.parse_body()


    def parse_header(self):
        header = self.frame[:25]

        horizontal_keys = {
            'Venda': ('venda', int),
            'Empreend.': ('empreendimento', None),
            'Cliente': ('cliente', None),
            'Celular': ('celular', None),
            'Residencial': ('residencial', None),
            'Comercial': ('comercial', None),
            'End.': (
                'endereco',
                search_address
            ),
            'Cidade': ('cidade', None),
            'UF': ('uf', None),
            'CEP': ('cep', None),
            'Bairro': ('bairro', None)
        }

        vertical_keys = {
            'Nome': ('nome', None),
            'CPF/CNPJ': ('documento', None)
        }

        data = {}

        quadra_match = re.search(
            r'QUADRA\s+(\d+)',
            str(header.iloc[15, 0])
        )

        if quadra_match:
            data['quadra'] = quadra_match.group(1)
        else:
            data['quadra'] = '-'

        lote_match = re.search(
            r'(\d+)',
            str(header.iloc[16, 0])
        )

        if lote_match:
            data['lote'] = lote_match.group(1)
        else:
            data['lote'] = '-'

        for row_index, row in header.iterrows():
            for cell_index, cell in enumerate(row):
                for key, value in horizontal_keys.items():
                    if re.match(f'{key}\\s*:', str(cell), re.I):
                        candidates = header.iloc[
                            row_index,
                            cell_index + 1 : cell_index + 4
                        ]

                        candidates = candidates.replace(
                            r'^\s*$', None, regex=True
                        )

                        index = candidates.first_valid_index()

                        if index is None:
                            continue

                        entry = candidates.loc[index]

                        if value[1]:
                            entry = value[1](entry)

                        data[value[0]] = entry

                for key, value in vertical_keys.items():
                    if re.match(f'{key}', str(cell), re.I):
                        entry = header.iloc[row_index + 1, cell_index]

                        if value[1]:
                            entry = value[1](entry)

                        data[value[0]] = entry

        return data


    def parse_body(self):
        header_index = self.frame.index[
            self.frame.iloc[:,0] == 'Parcela'
        ][0]

        self.frame.columns = self.frame.iloc[header_index]

        body = pd.DataFrame(columns = [
            'data-vencimento',
            'valor-parcela',
            'data-recebimento',
            'principal',
            'juros',
            'correcao',
            'multa',
            'juros-atrasado',
            'desc-ant'
        ])

        for _, row in self.frame.iterrows():
            if re.match(r'\d{1,2}/\d{1,2}/\d{4}', str(row['Dt Vencim'])):
                row = pd.Series({
                    'data-vencimento': row.get('Dt Vencim'),
                    'valor-parcela': row.get('Valor Parc.'),
                    'data-recebimento': row.get('Dt. Receb.'),
                    'principal': row.get('Principal'),
                    'juros': row.get('Juros'),
                    'correcao': row.get('Correção'),
                    'multa': row.get('Multa'),
                    'juros-atrasado': row.get('Juros Atr.'),
                    'desc-ant': row.get('Desc. Ant')
                }).to_frame().T

                body = pd.concat([body, row], ignore_index = True)

        return body
