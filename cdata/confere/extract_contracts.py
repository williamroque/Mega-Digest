import pandas as pd

import sys

data_file = sys.argv[1]
data = pd.read_excel(data_file)

data_height = len(data)
row_i = 0

txt = ''

while row_i < data_height:
    lote = data.loc[row_i, 'Lote']
    cliente = data.loc[row_i, 'Cliente']
    documento = data.loc[row_i, 'Documento']

    txt += str(lote) + ';'
    txt += str(documento) + ';'
    txt += str(cliente).strip() + '\n'

    row_i += 1

with open('contract_data.txt', 'w+') as f:
    f.write(txt)
