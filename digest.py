import pandas as pd

import os

import re

# Paths for excel files
saldos_path = './saldos/'
boletins_path = './boletins/'

# Excel files
saldos_files = os.listdir(saldos_path)
boletins_files = os.listdir(boletins_path)

# Exclude files with these prefixes
excluded_prefixes = ['~']

# Function for prefix exclusion filter
def exclude_func(x):
    for prefix in excluded_prefixes:
        if x[0] == prefix:
            return False
    return True

# Filter file lists for prefix exclusion
saldos_files = list(filter(exclude_func, saldos_files))
boletins_files = list(filter(exclude_func, boletins_files))

# Dictionary for boletins-saldos map
boletins_saldos_map = {}

# Test for int
def isInt(x):
    try:
        int(x)
        return True
    except ValueError:
        return False

# Map boletins to saldos for data compilation
for boletim_file in boletins_files:
    saldo = ''

    # While saldo is empty and is not int
    while saldo == '':

        # Print options for saldo files
        for index, saldo_file in enumerate(saldos_files):
            print(str(index) + ' ' + saldo_file)

        # Choose option
        saldo_input = input(boletim_file + ' > ')

        # If option is integer and within range, set saldo to input
        if isInt(saldo_input) and int(saldo_input) < len(saldos_files):
            saldo = saldo_input

    # Map boletins to saldos
    boletins_saldos_map[boletim_file] = saldos_files[int(saldo)]

# Read excel files
file_dataframes = []

for boletim, saldo in boletins_saldos_map.items():
    bdf = pd.read_excel(boletins_path + boletim)
    sdf = pd.read_excel(saldos_path + saldo)

    file_dataframes.append([bdf, sdf])

# Compile raw data
empreendimentos = ['PVV']

# Saldo and boletim files end margin from bottom
sdf_end_margin = 1
bdf_end_margin = 21

# Is client name
is_name = re.compile('\d+ - .+')

# Get lote number from name
match_unidade = re.compile('\d+')

# Find quadra
match_quadra = re.compile('QD .[\w\d]+')

# Begins with empreendimento
begins_with_empr = re.compile('^empreendimento', re.I)

# Find date
match_date = re.compile('\d{4}-\d{2}-\d{2}')

# For each file dataframe
for file_dataframe in file_dataframes:
    # Dataframe for boletim and saldo, separately
    bdf = file_dataframe[0]
    sdf = file_dataframe[1]

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
        'CPF': 9
    }

    # For each row until last row for iteration in sdf
    while sdf_row < sdf_row_end:
        # Get name of client
        name = sdf.iloc[sdf_row, sdf_data_cols['name']]

        # Get CPF of client
        cpf = sdf.iloc[sdf_row, sdf_data_cols['CPF']]

        # Map client name to CPF in spf client data
        sdf_client_data[name] = cpf

        sdf_row += 1

    bdf_client_data = {}
    bdf_row = 19
    bdf_row_end = len(bdf.index) - bdf_end_margin

    bdf_data_cols = {
        'sequencia': 1,
        'data': 4,
        'valor_pagamento': 26,
        'LATEFEE--------------------':'--------------------------',
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
        format_number = lambda x: '{0:.2f}'.format(x)

        # Add row data to name
        bdf_client_data[parsed_name].append({
            'empreendimento': empreendimento,
            'quadra': quadra,
            'unidade': match_unidade.match(name).group(0),
            'sequencia': str(bdf.iloc[bdf_row, bdf_data_cols['sequencia']]),
            'data': match_date.match(str(bdf.iloc[bdf_row, bdf_data_cols['data']])).group(0),
            'valor_pagamento': format_number(bdf.iloc[bdf_row, bdf_data_cols['valor_pagamento']]),
            'atraso': '------',
            'multa': format_number(bdf.iloc[bdf_row, bdf_data_cols['multa']]),
            'desconto': format_number(bdf.iloc[bdf_row, bdf_data_cols['desconto']])
        })

        bdf_row += 1

    # Print out rows
    for key in bdf_client_data:
        for row in bdf_client_data[key]:
            print(key + ' | ' + sdf_client_data[key], end=' | ')
            for loc in row:
                print(row[loc], end=' | ')
            print(' ')

