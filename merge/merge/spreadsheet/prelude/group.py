from curva.framework.spreadsheet.group import Group
from curva.framework.spreadsheet.cell import Cell
from curva.spreadsheet.prelude.style import stylesheet

import copy


class PreludeGroup(Group):
    def __init__(self, parent_section, inputs, title, body, body_class_list, group_id, column_width=None):
        super().__init__(parent_section, inputs, group_id, [2, 0])

        self.column_width = column_width

        self.add_row()

        header_cell = Cell(
            self,
            inputs,
            'header',
            {
                'text': title
            },
            set(['prelude_header']),
            column_width,
            stylesheet
        )
        self.add_cell(header_cell)

        row_offset = 0
        for i, body_row in enumerate(body):
            if 'format' in body_row:
                body_row_format = body_row['format']
            else:
                body_row_format = body_class_list

            if 'repeat' in body_row:
                repeat_by = body_row['repeat']

                if type(repeat_by) == int:
                    for repeat_i in range(repeat_by):
                        content = copy.copy(body_row)
                        content['text'] = content['text'].format(
                            index=repeat_i
                        )

                        self.create_body_cell(
                            row_offset,
                            content,
                            body_row_format
                        )
                        row_offset += 1
                elif type(repeat_by) == list:
                    for repeat_i, repeat_item in enumerate(repeat_by):
                        content = copy.copy(body_row)
                        content['text'] = content['text'].format(
                            index=repeat_i,
                            item=repeat_item
                        )

                        self.create_body_cell(
                            row_offset,
                            content,
                            body_row_format
                        )
                        row_offset += 1
            else:
                self.create_body_cell(
                    row_offset,
                    body_row,
                    body_row_format
                )
                row_offset += 1

    def create_body_cell(self, offset, content, cell_format):
        self.add_row()

        content = copy.deepcopy(content)
        if 'references' in content:
            for reference in content['references']:
                path = reference['path']
                if len(path) < 3:
                    path.append(offset)

        cell = Cell(
            self,
            self.inputs,
            f'body_{offset}',
            content,
            cell_format,
            self.column_width,
            stylesheet
        )
        self.add_cell(cell)

    def query(self, row):
        if len(self.cells) > 1:
            row = min(row, len(self.cells) - 2)
            cell_id = f'body_{row}'
            return next(cell for cell in self.cells if cell.id == cell_id)
        return None

