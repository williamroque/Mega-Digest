const pScript = `
import pandas as pd

import os
import sys

import re

# Excel files
boletim_file = sys.argv[1]
saldo_file = sys.argv[2]

# Read excel files
bdf = pd.read_excel(boletim_file)
sdf = pd.read_excel(saldo_file)

# Compile raw data

# List of possible empreendimentos
empreendimentos = ['PVV']

# Saldo and boletim files end margin from bottom
sdf_end_margin = 1
bdf_end_margin = 21

# Is client name
is_name = re.compile('\\d+ - .+')

# Get lote number from name
match_unidade = re.compile('\\d+')

# Find quadra
match_quadra = re.compile('QD .[\\w\\d]+')

# Begins with empreendimento
begins_with_empr = re.compile('^empreendimento', re.I)

# Find date
match_date = re.compile('\\d{4}-\\d{2}-\\d{2}')

# Strip document to number
match_num = re.compile('\\d+')
strip_doc = lambda x: ''.join(match_num.findall(x))

# sdf handling

# Client data for sdf
sdf_client_data = {}

# Dimensions for sdf
sdf_dim = sdf.shape
sdf_height = sdf_dim[0]
sdf_width = sdf_dim[1]

# Find data cols

# Title cells
sdf_title_row = 0

# Row index
sdf_title_col = 0

# Max constraints for title cols
sdf_title_max = sdf_width - 1

# Required columns
sdf_data_cols = {
    'name': False,
    'document': False
}

# For each title col
while sdf_title_col < sdf_title_max:
    # Set title to title col value
    sdf_title = sdf.iloc[sdf_title_row, sdf_title_col]

    # If title is 'Cliente', set 'name' data col to current column index
    # If title is 'Documento', set 'document' data col to current column index
    if sdf_title == 'Cliente':
        sdf_data_cols['name'] = sdf_title_col
    elif sdf_title == 'Documento':
        sdf_data_cols['document'] = sdf_title_col

    sdf_title_col += 1

for col in sdf_data_cols:
    if not sdf_data_cols[col]:
        print('Requires', col, 'data')
        sys.exit()

# Current row for iteration
sdf_row = 3

# Last row for iteration
sdf_row_end = sdf_height - sdf_end_margin

# For each row until last row for iteration in sdf
while sdf_row < sdf_row_end:
    # Get name of client
    name = sdf.iloc[sdf_row, sdf_data_cols['name']]

    # Get document of client
    document = sdf.iloc[sdf_row, sdf_data_cols['document']]

    # Strip document
    document = strip_doc(document)

    # Get document type
    if len(document) == 11:
        document_type = 'F'
    else:
        document_type = 'J'

    # Map client name to document in spf client data
    sdf_client_data[name] = [document.rjust(14), document_type]

    sdf_row += 1

bdf_dim = bdf.shape
bdf_height = bdf_dim[0]
bdf_width = bdf_dim[1]

bdf_title_row = 12
bdf_title_col = 0
bdf_title_max = bdf_width - 1

bdf_data_cols = {
    'sequencia': False,
    'data': False,
    'valor_pagamento': False,
    'mora': False,
    'multa': False,
    'desconto': False
}

while bdf_title_col < bdf_title_max:
    title = bdf.iloc[bdf_title_row, bdf_title_col]

    if title == 'Sequ\\u00EAncia':
        bdf_data_cols['sequencia'] = bdf_title_col
    elif title == 'Data\\nBaixa':
        bdf_data_cols['data'] = bdf_title_col
    elif title == 'Valor\\nPago':
        bdf_data_cols['valor_pagamento'] = bdf_title_col
    elif title == 'Valor \\nMora':
        bdf_data_cols['mora'] = bdf_title_col
    elif title == 'Valor\\nMulta':
        bdf_data_cols['multa'] = bdf_title_col
    elif title == 'Valor \\nDesconto':
        bdf_data_cols['desconto'] = bdf_title_col

    bdf_title_col += 1

for col in bdf_data_cols:
    if not bdf_data_cols[col]:
        print('Requires', col, 'data')
        sys.exit()

bdf_client_data = {}
bdf_row = 19
bdf_row_end = bdf_height - bdf_end_margin

# Current empreendimento
empreendimento = ''
quadra = ''

# Get contract data
dir_path = os.path.dirname(os.path.realpath(__file__))
contract_data_path = dir_path + '/contract_data.txt'
contract_data = {}

with open(contract_data_path, 'r') as f:
    for line in f:
        line_data = line.split(';')
        *line_data, line_name = line_data
        line_name = line_name[:-1]
        if not line_name in contract_data:
            contract_data[line_name] = [line_data]
        else:
            contract_data[line_name].append(line_data)

if contract_data == []:
    print('Unable to read contract data')
    sys.exit()

# For each bdf row
while bdf_row < bdf_row_end:
    # Client name
    name = str(bdf.iloc[bdf_row, 0])

    # If is not client name
    if not is_name.match(name):

        # If is empreendimento name
        if begins_with_empr.match(name):

            # Check if empreendimento name exists and set current empreendimento and quadra
            for empr in empreendimentos:
                if name.lower().find(empr.lower()) > -1:
                    empreendimento = empr
                    quadra = match_quadra.search(name).group(0)[3:]

        bdf_row += 1
        continue

    # Name without unidade
    parsed_name = name[5:]

    # Create name key if not mapped
    if not parsed_name in bdf_client_data:
        bdf_client_data[parsed_name] = []

    # Get unidade
    unidade = match_unidade.match(name).group(0)
    contract = ''

    if parsed_name in contract_data:
        name_target = contract_data[parsed_name]
        for line in name_target:
            if line[0] == unidade:
                contract = line[1]
    else:
        print(parsed_name, 'not in contract data')
        bdf_row += 1
        continue

    # Format number to two decimal places
    format_number = lambda x: '{0:015.2f}'.format(x).replace('.', ',')

    # Add row data to name
    bdf_client_data[parsed_name].append({
        'empreendimento': empreendimento,
        'quadra': quadra,
        'unidade': '{0:02}'.format(int(unidade)),
        'contrato': contract,
        'sequencia': str(bdf.iloc[bdf_row, bdf_data_cols['sequencia']]),
        'data': match_date.match(str(bdf.iloc[bdf_row, bdf_data_cols['data']])).group(0),
        'valor_pagamento': format_number(bdf.iloc[bdf_row, bdf_data_cols['valor_pagamento']]),
        'atraso': format_number(bdf.iloc[bdf_row, bdf_data_cols['mora']]),
        'multa': format_number(bdf.iloc[bdf_row, bdf_data_cols['multa']]),
        'desconto': format_number(bdf.iloc[bdf_row, bdf_data_cols['desconto']])
    })

    bdf_row += 1

# Write data to target .txt file
txt = ''
for key in bdf_client_data:
    for row in bdf_client_data[key]:
        txt += sdf_client_data[key][1] + ';'
        txt += sdf_client_data[key][0] + ';'
        txt += row['unidade'] + ';'
        txt += row['contrato'] + ';'
        txt += row['sequencia'] + ';'
        txt += row['data'] + ';'
        txt += row['valor_pagamento'] + ';'
        txt += row['atraso'] + ';'
        txt += row['multa'] + ';'
        txt += row['desconto'] + '\\n'

with open(sys.argv[3], 'w+') as f:
    f.write(txt)
`;

module.exports = pScript;
