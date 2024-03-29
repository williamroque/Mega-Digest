import pandas as pd

import os
import sys

import re
import json

import datetime

inputs = json.loads(sys.stdin.readlines()[0])

boletim_file = inputs['planilhas-saldo'][0]

bdf = pd.read_excel(boletim_file)

contract_data = {}
for line in inputs['data']:
    line_data = [line[header.replace('.', '')] for header in inputs['headers'] if header != 'Nome']
    name = line['Nome']

    if not name in contract_data:
        contract_data[name] = [line_data]
    else:
        contract_data[name].append(line_data)

is_name = re.compile('^\d+ - .+')

strip_unidade = lambda x: re.sub('^.*?-\s?', '', x)

match_unidade = re.compile('\d+')

begins_with_empr = re.compile('^empreendimento', re.I)

match_date = re.compile('\d{4}-\d{2}-\d{2}')
format_date = lambda x: '/'.join(match_date.match(x).group(0).split('-')[::-1])

match_sequence = re.compile('\d+/\d+')

match_num = re.compile('\d+')
strip_doc = lambda x: ''.join(match_num.findall(x))

match_quadra = re.compile('(qd|quadra) (([A-z]?\d+)|(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})))(\s*-\s*[A-z])?', re.I)
def get_quadra(x):
    match = match_quadra.search(x)
    if match and len(match.group(0)) > 3:
        return match.group(0)
    else:
        return ''

is_term = False
match_term = re.compile('termo', re.I)
check_term = lambda x: bool(match_term.match(x))

client_data = {}

for client in contract_data:
    if not client in client_data:
        data = []

        document = strip_doc(contract_data[client][0][2])

        if len(document) == 11:
            document_type = 'F'
        else:
            document_type = 'J'

        client_data[client] = [document.rjust(14), document_type]

bdf_dim = bdf.shape

bdf_height = bdf_dim[0]
bdf_width = bdf_dim[1]

bdf_title_row = 12
bdf_title_col = 0
bdf_title_max = bdf_width - 1

bdf_data_cols = {
    'sequencia': False,
    'data': False,
    'vencimento': False,
    'valor_pagamento': False,
    'mora': False,
    'multa': False,
    'desconto': False
}

while bdf_title_col < bdf_title_max:
    title = bdf.iloc[bdf_title_row, bdf_title_col]
    title = re.sub('\s', '', str(title).strip().lower())

    if title == 'sequ\u00EAncia':
        bdf_data_cols['sequencia'] = bdf_title_col
    elif title == 'databaixa':
        bdf_data_cols['data'] = bdf_title_col
    elif title == 'vencimento':
        bdf_data_cols['vencimento'] = bdf_title_col
    elif title == 'valorpago':
        bdf_data_cols['valor_pagamento'] = bdf_title_col
    elif title == 'valormora':
        bdf_data_cols['mora'] = bdf_title_col
    elif title == 'valormulta':
        bdf_data_cols['multa'] = bdf_title_col
    elif title == 'valordesconto':
        bdf_data_cols['desconto'] = bdf_title_col

    bdf_title_col += 1

for col in bdf_data_cols:
    if not bdf_data_cols[col]:
        print('Requires', col, 'data')
        sys.exit(0)

bdf_client_data = {}
bdf_row = 19

not_partial = ['dinheiro', 'banco', 'cheque', 'ted']
is_partial = False

quadra = ''

while bdf_row < bdf_height:
    name = str(bdf.iloc[bdf_row, 0])

    if not is_name.match(name):
        if check_term(name):
            is_term = True

        elif begins_with_empr.match(name):
            quadra = get_quadra(name)
            is_term = False

        elif name.lower() == 'repasse':
            is_partial = True

        elif name.lower() in not_partial:
            is_partial = False

        bdf_row += 1
        continue

    if is_term:
        print('Skipped', name, 'due to term type')
        bdf_row += 1
        continue

    p_type = 'C'
    if is_partial:
        p_type = 'B'

    date = format_date(str(bdf.iloc[bdf_row, bdf_data_cols['data']]))

    vencimento = format_date(str(bdf.iloc[bdf_row, bdf_data_cols['vencimento']]))
    vencimento_obj = datetime.datetime.strptime(vencimento, '%d/%m/%Y')

    now_obj = datetime.datetime.now()

    if vencimento_obj.month > now_obj.month and vencimento_obj.year >= now_obj.year or vencimento_obj.year > now_obj.year:
        print('Skipped', name, 'due to month incompatibility')
        bdf_row += 1
        continue


    parsed_name = strip_unidade(name).strip()

    if not parsed_name in bdf_client_data:
        bdf_client_data[parsed_name] = []

    unidade = match_unidade.match(name).group(0)
    contract = ''

    if parsed_name in contract_data:
        name_target = contract_data[parsed_name]
        quadra = re.sub('(QUADRA|QD) ', '', quadra, re.I)

        for i, line in enumerate(name_target):
            if int(line[0]) == int(unidade):
                if line[-1] == quadra or line[-1] == '':
                    contract = line[1]
                    break
                elif i == len(name_target) - 1:
                    print(name, 'not in contract data at', quadra)
        else:
            bdf_row += 1
            continue
    else:
        print(name, 'not in contract data')
        bdf_row += 1
        continue

    format_number = lambda x: '{0:015.2f}'.format(x).replace('.', ',')

    pad_sequencia = lambda x: x.rjust(3, '0')
    format_sequencia = lambda x: '/'.join(map(pad_sequencia, x.split('/')))

    bdf_client_data[parsed_name].append({
        'quadra': quadra,
        'unidade': '{0:03}'.format(int(unidade)),
        'contrato': contract,
        'sequencia': format_sequencia(match_sequence.match(str(bdf.iloc[bdf_row, bdf_data_cols['sequencia']])).group(0)),
        'data': date,
        'valor_pagamento': format_number(bdf.iloc[bdf_row, bdf_data_cols['valor_pagamento']]),
        'atraso': format_number(bdf.iloc[bdf_row, bdf_data_cols['mora']]),
        'multa': format_number(bdf.iloc[bdf_row, bdf_data_cols['multa']]),
        'p_type': p_type,
        'desconto': format_number(bdf.iloc[bdf_row, bdf_data_cols['desconto']])
    })

    bdf_row += 1

txt = ''
for key in bdf_client_data:
    for row in bdf_client_data[key]:
        txt += client_data[key][1] + ';'
        txt += client_data[key][0] + ';'
        txt += row['unidade'] + ';'
        txt += row['contrato'] + ';'
        txt += row['sequencia'] + ';'
        txt += row['data'] + ';'
        txt += row['valor_pagamento'] + ';'
        txt += row['atraso'] + ';'
        txt += row['multa'] + ';'
        txt += row['desconto'] + ';'
        txt += row['p_type'] + '\n'

with open(inputs['output-path'], 'w+', encoding='utf8') as f:
    f.write(txt)
