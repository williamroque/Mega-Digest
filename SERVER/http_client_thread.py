import threading
from parse_http import HTTPRequest
from create_http import HTTPResponse

import urllib.parse
import mimetypes

import re
import os

INDEX_PATH = 'data/index.html'

class HttpClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

    def send_http_response(self, response):
        proto = response.proto.encode('utf-8')
        headers = response.headers.encode('utf-8')
        body = response.body.encode('utf-8')

        self.connection.send(proto)
        self.connection.send(headers)
        self.connection.send(b'\n')
        self.connection.send(body)

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            if mes:
                request = HTTPRequest(mes)

                command = request.command
                path = request.path
                request_type = mimetypes.guess_type(path)
                error_code = request.error_code
                error_message = request.error_message

                response = HTTPResponse('error', 422, 'text/html')

                print(command, path, request_type[0])

                if command == 'GET':
                    if os.path.exists('data' + path):
                        if request.path == '/':
                            response = HTTPResponse('resource', INDEX_PATH, request_type[0])
                        else:
                            response = HTTPResponse('resource', 'data' + path, request_type[0])
                    else:
                        response = HTTPResponse('error', 404, 'text/html')
                elif command == 'UPDATE':
                    data = ''
                    exited_with_error = False

                    with open('data/contract_data.txt', 'r') as f:
                        raw_data = re.sub('\n{2,}', '\n', f.read())

                        data = raw_data.split('\n')

                        term, value = urllib.parse.unquote(path)[1:].split('=')

                        for i, row in enumerate(data):
                            if row == term:
                                data[i] = value
                                break
                        else:
                            response = HTTPResponse('error', 501, 'text/plain')
                            exited_with_error = True

                    if not exited_with_error:
                        with open('data/contract_data.txt', 'w') as f:
                                f.write('\n'.join(data))
                                response = HTTPResponse('action-response', 200, 'text/plain')

                elif command == 'DELETE':
                    data = ''
                    exited_with_error = False

                    with open('data/contract_data.txt', 'r') as f:
                        raw_data = f.read()

                        data = raw_data.split('\n')

                        term = urllib.parse.unquote(path)[1:]

                        for i, row in enumerate(data):
                            if row == term:
                                del data[i]
                                break
                        else:
                            exited_with_error = True
                            response = HTTPResponse('error', 501, 'text/plain')

                    if not exited_with_error:
                        with open('data/contract_data.txt', 'w') as f:
                                f.write('\n'.join(data))
                                response = HTTPResponse('action-response', 200, 'text/plain')

                elif command == 'ADD':
                    data = ''
                    with open('data/contract_data.txt', 'r') as f:
                        raw_data = f.read()

                        data = raw_data.strip().split('\n')
                        data.append(urllib.parse.unquote(path)[1:])

                    with open('data/contract_data.txt', 'w+') as f:
                        f.write('\n'.join(data))

                    response = HTTPResponse('action-response', 200, 'text/plain')

                self.send_http_response(response)

            else:
                print('Done.')
                self.connection.close()
                break
