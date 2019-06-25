HEADERS = """
Content-Type: text/html; encoding=utf8
Content-Length: {}
Connection: close
"""

class HTTPResponse():
    def __init__(self, response_type, response_value):
        self.type = response_type
        self.value = response_value

        self.proto = 'HTTP/1.1 {} OK'.format(response_value)
        self.body = self.render_body()
        self.headers = HEADERS.format(len(self.body))

    def render_body(self):
        body = None

        if self.type == 'error':
            if self.value == 404:
                body = '404: page not found'
            else:
                body = '422: invalid request'
        elif self.type == 'resource':
            with open(self.value, 'r') as f:
                body = f.read()

        return body
