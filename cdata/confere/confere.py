import re

cdata_all = {}

with open('cdata_all.txt', 'r', encoding='utf-8-sig') as f:
    for line in f.read().split('\n'):
        if line:
            lote, documento, cliente = line.split(';')
            lote = re.match('\d+', lote)
            if lote is not None:
                lote = lote.group(0)
            else:
                lote = ''
            lote = lote.zfill(4)
            cliente_san = cliente.replace('&', 'E')
            cliente_san = re.sub('[^A-Za-z0-9]+', '', cliente)
            if not cliente_san in cdata_all:
                cdata_all[cliente_san] = {lote: cliente}
            else:
                cdata_all[cliente_san][lote] = cliente

cdata_server = {}

with open('cdata_server.txt', 'r', encoding='utf-8-sig') as f:
    for line in f.read().split('\n'):
        if line:
            lote, _, documento, cliente = line.split(';')
            lote = re.match('\d+', lote)
            if lote is not None:
                lote = lote.group(0)
            else:
                lote = ''
            lote = lote.zfill(4)
            cliente_san = cliente.replace('&', 'E')
            cliente_san = re.sub('[^A-Za-z0-9]+', '', cliente)
            if not cliente_san in cdata_server:
                cdata_server[cliente_san] = {lote: cliente}
            else:
                cdata_server[cliente_san][lote] = cliente

for client in cdata_all:
    for contract in cdata_all[client]:
        if not client in cdata_server or not contract in cdata_server[client]:
            print(contract, '-', cdata_all[client][contract], '(' + client + ')', 'not in server.\n')
