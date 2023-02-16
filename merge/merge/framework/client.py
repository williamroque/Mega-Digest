import re
from copy import copy

import datetime

import pandas as pd

pd.set_option('display.max_rows', None)

class Client:
    def __init__(self, extrato, history):
        self.extrato = extrato
        self.history = history

        self.data = copy(self.extrato.header)

        self.write_history()

    def write_history(self):
        history = {}

        for _, row in self.extrato.body.iterrows():
            vencimento = datetime.datetime.strptime(
                row['data-vencimento'], '%d/%m/%Y'
            )
            vencimento = vencimento.strftime('%m/%Y')

            try:
                recebimento = datetime.datetime.strptime(
                    row['data-recebimento'], '%d/%m/%Y'
                )
            except ValueError:
                recebimento = None

            name = self.data['nome']
            value = row['valor-parcela']

            entry = (
                float(row['valor-parcela']),
                bool(recebimento) or self.history.has(vencimento, name, value)
            )

            history[vencimento] = entry

        self.data['history'] = pd.Series(history)

    def to_series(self):
        endereco, *numero = self.data['endereco']
        numero = next(x for x in numero if x is not None)

        series = {
            'Filial': '-',
            'Empreendimento': self.data.get('empreendimento', '-'),
            'Quadra': self.data.get('quadra', '-'),
            'Lote': self.data.get('lote', '-'),
            'Área Priv.': '-',
            'Ocorrência': '-',
            'Contrato': '-',
            'Tabela': '-',
            'Cliente': self.data.get('nome', '-'),
            'Documento': self.data.get('documento', '-'),
            'Dt. Nasc.': '-',
            'Cônjuge': '-',
            'Dt. Nasc. Cônjuge': '-',
            'Endereço': endereco,
            'Número': numero,
            'Bairro': self.data.get('bairro', '-'),
            'Complemento': '-',
            'Cidade': self.data.get('cidade', '-'),
            'Estado': self.data.get('uf', '-'),
            'CEP': self.data.get('cep', '-'),
            'Telefone(s)': '-'.join(x for x in [
                f'CEL: {self.data["celular"]}' if 'celular' in self.data else '',
                f'RES: {self.data["residencial"]}' if 'residencial' in self.data else '',
                f'COM: {self.data["comercial"]}' if 'comercial' in self.data else ''
            ] if x),
            'E-mail': '-',
            'Status Contrato': '-',
            'Classificação': '-',
            'Data Assinatura': '-',
            'Nº Meses': '-',
            'Nº Meses Adimp.': '-',
            'Dt. Último Venc.': '-',
            'Nº Meses a Vencer': '-',
            'Valor Atraso': '-',
            'Nº Parc. Atraso': '-',
            'Total Valor Financ.': '-',
            'Data Financ.': '-',
            'Valor Rec. Atualiz.': '-',
            'Saldo p/ Quitação': '-',
	    'Preço Tabela': '-',
            'Valor Compra': '-',
	    'Valor Compra Atualiz.': '-',
            '% Garantia': '-',
            'Total Valor Futuro': '-'
        }

        return pd.Series(series)
