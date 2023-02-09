import re

import pandas as pd


class Extrato():
    def __init__(self, path):
        self.frame = pd.read_excel(path)
        self.header = self.parse_header()
        self.body = self.parse_body()


    def parse_header(self):
        header = self.frame[:25]

        horizontal_keys = {
            'Venda': ('venda', None),
            'Empreend.': ('empreendimento', None),
            'Cliente': ('cliente', None),
            'Celular': ('celular', None),
            'End.': ('endereco', None),
            'Cidade': ('cidade', lambda x: x),
            'UF': ('uf', None),
            'CEP': ('cep', None),
            'Bairro': ('bairro', lambda x: x)
        }

        vertical_keys = {
            'Nome': ('nome', lambda x: x.title()),
            'CPF/CNPJ': ('cpf', None)
        }

        data = {}

        for row_index, row in header.iterrows():
            for cell_index, cell in enumerate(row):
                for key, value in horizontal_keys.items():
                    if re.match(f'{key}\\s*:', str(cell), re.I):
                        entry = header.iloc[
                            row_index,
                            cell_index + 1 : cell_index + 4
                        ].any()

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
                    'data-vencimento': row['Dt Vencim'],
                    'valor-parcela': row['Valor Parc.'],
                    'data-recebimento': row['Dt. Receb.'],
                    'principal': row['Principal'],
                    'juros': row['Juros'],
                    'correcao': row['Correção'],
                    'multa': row['Multa'],
                    'juros-atrasado': row['Juros Atr.'],
                    'desc-ant': row['Desc. Ant']
                }).to_frame().T

                body = pd.concat([body, row], ignore_index = True)

        return body
