from merge.models.extrato import Extrato
from merge.models.francesinha import Francesinha
from merge.util.input import Input

# from merge.spreadsheet.curve_sheet import CurveSheet


def main():
    print('Processing inputs.', flush=True)

    inputs = Input()

    extrato = Extrato(inputs.get('planilha-extrato'))

    francesinhas = [
        Francesinha(path) for path in inputs.get('planilhas-francesinha')
    ]

    print('Inputs processed.\n', flush=True)

    print('Rendering saldo.', flush=True)

    # sheet = CurveSheet(inputs)
    # sheet.render()

    print('Saldo rendered.\n', flush=True)
