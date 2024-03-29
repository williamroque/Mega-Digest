import xlsxwriter


class Spreadsheet():
    def __init__(self, inputs, props, padding, workbook=None):
        self.inputs = inputs

        self.sections = []

        self.title = props['sheet_title']

        self.workbook = workbook

        if self.workbook is None:
            self.workbook = xlsxwriter.Workbook(props['output_path'])
            self.workbook.set_size(props['width'], props['height'])

        self.sheet = self.workbook.add_worksheet(props['sheet_title'])
        self.sheet.set_default_row(15)

        self.padding = padding

    def add_image(self, *args):
        self.sheet.insert_image(*args)

    def add_section(self, section):
        vertical_offset, horizontal_offset = self.padding

        for s in self.sections:
            horizontal_offset += s.get_dimensions()[1]

        section.set_bounds(
            vertical_offset,
            horizontal_offset
        )

        self.sections.append(section)

    def query(self, section_id):
        search_generator = (
            section for section in self.sections if section.id == section_id)
        try:
            return next(search_generator)
        except StopIteration:
            return None

    def render(self, close=True):
        for section in self.sections:
            section.render(self.sheet, self.workbook)

        if close:
            self.workbook.close()
