import pandas as pd

import os

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
    while saldo == '' or not isInt(saldo):
        for index, saldo_file in enumerate(saldos_files):
            print(str(index) + ' ' + saldo_file)
        saldo = input(boletim_file + ' > ')
    boletins_saldos_map[boletim_file] = saldos_files[int(saldo)]

# Read excel files
file_dataframes = []

for boletim, saldo in boletins_saldos_map.items():
    bdf = pd.read_excel(boletins_path + boletim)
    sdf = pd.read_excel(saldos_path + saldo)

    print(bdf, sdf)

    file_dataframes.append([bdf, sdf])
