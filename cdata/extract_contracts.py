import pandas as pd
import re

import sys

data_file = sys.argv[1]
data = pd.read_excel(data_file)

data_height = len(data)
row_i = 0

txt = ''

match_quadra = re.compile('((QUADRA|QD) M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|(QUADRA|QD) [A-Z]?\d+)( (\s|-)*[A-Z]+)?$')

while row_i < data_height:
    lote = data.loc[row_i, 'NOME_LOTE']
    contrato = data.loc[row_i, 'CONTRATO']
    cliente = data.loc[row_i, 'NOME_CLI']
    documento = data.loc[row_i, 'CPF_CNPJ']
    quadra = match_quadra.search(data.loc[row_i, 'NOME_QUADRA'])

    txt += str(lote) + ';'
    txt += str(contrato) + ';'
    txt += str(documento) + ';'
    if quadra:
        txt += str(cliente).strip() + ';'
        txt += re.sub('(QD|QUADRA) ', '', quadra.group(0), re.I) + '\n'
    else:
        txt += str(cliente).strip() + '\n'

    row_i += 1

with open('contract_data.txt', 'w+') as f:
    f.write(txt)
