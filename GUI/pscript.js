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

# Row index
sdf_row = 3

# Last row for iteration
sdf_row_end = len(sdf.index) - sdf_end_margin

# Required columns
sdf_data_cols = {
    'name': 8,
    'document': 9
}

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

bdf_client_data = {}
bdf_row = 19
bdf_row_end = len(bdf.index) - bdf_end_margin

bdf_data_cols = {
    'sequencia': 1,
    'data': 4,
    'valor_pagamento': 26,
    'mora': 16,
    'multa': 15,
    'desconto': 18
}

# Current empreendimento
empreendimento = ''
quadra = ''

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

    # Format number to two decimal places
    format_number = lambda x: '{0:015.2f}'.format(x).replace('.', ',')

    # Add row data to name
    bdf_client_data[parsed_name].append({
        'empreendimento': empreendimento,
        'quadra': quadra,
        'unidade': '{0:02}'.format(int(match_unidade.match(name).group(0))),
        'sequencia': str(bdf.iloc[bdf_row, bdf_data_cols['sequencia']]),
        'data': match_date.match(str(bdf.iloc[bdf_row, bdf_data_cols['data']])).group(0),
        'valor_pagamento': format_number(bdf.iloc[bdf_row, bdf_data_cols['valor_pagamento']]),
        'atraso': format_number(bdf.iloc[bdf_row, bdf_data_cols['mora']]),
        'multa': format_number(bdf.iloc[bdf_row, bdf_data_cols['multa']]),
        'desconto': format_number(bdf.iloc[bdf_row, bdf_data_cols['desconto']])
    })

    bdf_row += 1

# Print out rows
txt = ''
for key in bdf_client_data:
    for row in bdf_client_data[key]:
        txt += sdf_client_data[key][1] + ';'
        txt += sdf_client_data[key][0] + ';'
        txt += row['unidade'] + ';'
        txt += '1234' + ';'
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
