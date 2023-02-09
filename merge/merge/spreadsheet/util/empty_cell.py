from curva.framework.spreadsheet.cell import Cell


class EmptyCell(Cell):
    def __init__(self, class_list, stylesheet):
        self.id = None

        self.stylesheet = stylesheet

        self.class_list = class_list

        self.format = {}
        self.compile_format()

    def render(self, sheet, workbook):
        sheet.write(
            self.vertical_offset,
            self.horizontal_offset,
            '',
            workbook.add_format(self.format)
        )
