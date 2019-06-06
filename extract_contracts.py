import pandas as pd

import sys

data_file = sys.argv[1]
data = pd.read_excel(data_file)

data_height = len(data)
row_i = 0

txt = ''

while row_i < data_height:
    lote = data.loc[row_i, 'NOME_LOTE']
    contrato = data.loc[row_i, 'CONTRATO']
    cliente = data.loc[row_i, 'NOME_CLI']
    documento = data.loc[row_i, 'CPF_CNPJ']

    txt += str(lote) + ';'
    txt += str(contrato) + ';'
    txt += str(documento) + ';'
    txt += str(cliente) + '\n'

    row_i += 1

with open('contract_data.txt', 'w+') as f:
    f.write(txt)
