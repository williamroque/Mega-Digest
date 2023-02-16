from merge.models.extrato import Extrato
from merge.models.francesinha import Francesinha
from merge.util.input import Input
from merge.framework.history import History
from merge.framework.client import Client

from merge.spreadsheet.saldo.saldo_sheet import SaldoSheet

from xlrd.biffh import XLRDError


def main():
    print('Processing inputs.', flush=True)

    inputs = Input()

    extratos = []

    for path in inputs.get('planilhas-extrato'):
        try:
            extratos.append(Extrato(path))
        except XLRDError:
            pass

    francesinhas = [
        Francesinha(path) for path in inputs.get('planilhas-francesinha')
    ]

    history = History(francesinhas)
    history.build()

    clients = [Client(extrato, history) for extrato in extratos]

    print('Inputs processed.\n', flush=True)

    print('Rendering saldo.', flush=True)

    sheet = SaldoSheet(inputs, clients)
    sheet.render()

    print('Saldo rendered.\n', flush=True)
