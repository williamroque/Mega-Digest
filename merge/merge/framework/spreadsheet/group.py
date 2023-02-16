class Group():
    def __init__(self, parent_section, inputs, group_id, margin):
        self.parent_section = parent_section
        self.inputs = inputs

        self.id = group_id
        self.margin = margin

        self.cells = []
        self.structure = []

    def add_row(self):
        self.structure.append([])

    def add_cell(self, cell):
        self.cells.append(cell)
        self.structure[-1].append(cell)

    def query(self, cell_id):
        search_generator = (cell for cell in self.cells if cell.id == cell_id)
        try:
            return next(search_generator)
        except StopIteration:
            return None

    def set_bounds(self, vertical_offset, horizontal_offset):
        self.vertical_offset = vertical_offset
        self.horizontal_offset = horizontal_offset

        for row_i, row in enumerate(self.structure):
            for cell_i, cell in enumerate(row):
                cell.set_bounds(
                    self.vertical_offset + row_i,
                    self.horizontal_offset + cell_i
                )

    def get_dimensions(self):
        max_vertical = len(self.structure)
        max_horizontal = max([len(row) for row in self.structure])

        return (
            max_vertical + self.margin[0],
            max_horizontal + self.margin[1]
        )

    def inject_style(self, callback, bias=0):
        for i, cell in enumerate(self.cells):
            cell.add_class(
                callback(i + bias * len(self.cells))
            )

    def render(self, sheet, workbook):
        for cell in self.cells:
            cell.render(sheet, workbook)
