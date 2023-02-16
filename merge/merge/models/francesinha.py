import re
import pandas as pd


class Francesinha():
    def __init__(self, path):
        self.frame = pd.read_excel(path)
        self.body = self.parse_body()


    def parse_body(self):
        self.frame.columns = self.frame.iloc[2]

        body = pd.DataFrame(columns = [
            'nome',
            'data-vencimento',
            'data-pagamento',
            'valor-titulo',
            'valor-cobrado'
        ])

        for _, row in self.frame[3:].iterrows():
            if not re.match(r'^\d+$', str(row['Nosso Número'])):
                break

            row = pd.Series({
                'nome': row['Nome do Pagador'],
                'data-vencimento': row['Vencimento'],
                'data-pagamento': row['Data Pagto'],
                'valor-titulo': row['Valor do Título'],
                'valor-cobrado': row['Valor Cobrado']
            }).to_frame().T

            body = pd.concat([body, row], ignore_index = True)

        return body
