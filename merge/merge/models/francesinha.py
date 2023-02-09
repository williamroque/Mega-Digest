import pandas as pd


class Francesinha():
    def __init__(self, path):
        self.frame = pd.read_excel(path)
        self.body = self.parse_body()

        print(self.body)


    def parse_body(self):
        end = self.frame.index[
            self.frame.iloc[:,0] is None
        ][0] - 1

        self.frame.columns = self.frame.iloc[4]

        body = pd.DataFrame(columns = [
            'nome',
            'vencimento',
            'data-pagamento',
            'valor-titulo',
            'valor-cobrado'
        ])

        for _, row in self.frame[:end].iterrows():
            row = pd.Series({
                'nome': row['Nome do Pagador'],
                'vencimento': row['Vencimento'],
                'data-pagamento': row['Data Pagto'],
                'valor-titulo': row['Valor do Título'],
                'valor-cobrado': row['Valor Cobrado']
            }).to_frame().T

            body = pd.concat([body, row], ignore_index = True)

        return body
