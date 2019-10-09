import re

HEADERS = """
Content-Type: {}; encoding=utf8
Content-Length: {}
Connection: close
"""

class HTTPResponse():
    def __init__(self, response_type, response_value, response_resource_type=None):
        self.type = response_type
        self.value = response_value

        self.resource_type = response_resource_type

        self.proto = 'HTTP/1.1 {} OK'.format(response_value)
        self.length = 0
        self.body = self.render_body()
        self.headers = HEADERS.format(self.resource_type, self.length)

    def render_body(self):
        body = None

        if self.type == 'error':
            if self.value == 404:
                body = '404: page not found. Stick to the index!'
            elif self.value == 501:
                body = 'row-not-found'
            elif self.value == 418:
                body = 'i-am-a-teapot'
            else:
                body = '422: invalid request. Stop making things up!'
        elif self.type == 'resource':
            with open(self.value, 'r', encoding='utf8') as f:
                body = re.sub('\n{2,}', '\n', f.read())
        elif self.type == 'action-response':
            body = ''

        self.length = len(body.encode('utf-8'))
        return body
