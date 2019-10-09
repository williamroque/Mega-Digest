import threading
from parse_http import HTTPRequest
from create_http import HTTPResponse

import urllib.parse
import mimetypes

import re
import os

import manage_users

import json

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

    def verify_credentials(self, username, password):
        if not manage_users.is_valid(username, password):
            response = HTTPResponse('error', 418, 'text/html')
            self.send_http_response(response)
            print('Done.')
            self.connection.close()
            return False
        return True

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            if mes:
                request = HTTPRequest(mes)

                command = request.command
                path = request.path
                body = path
                try:
                    body, credentials = urllib.parse.unquote(path).split('|')
                    username, password = credentials.split('=')
                except Exception:
                    pass

                request_type = mimetypes.guess_type(path)
                error_code = request.error_code
                error_message = request.error_message

                response = HTTPResponse('error', 422, 'text/html')

                if command == 'GET':
                    if path == '/':
                        request_type = 'text/html'
                        response = HTTPResponse('resource', INDEX_PATH, request_type)
                    elif body == '/contract_data':
                        if self.verify_credentials(username, password):
                            request_type = 'text/plain'
                            response = HTTPResponse('resource', 'contract_data.txt', request_type)
                        else:
                            break
                    elif os.path.exists('data' + path):
                        response = HTTPResponse('resource', 'data' + path, request_type[0])
                    else:
                        response = HTTPResponse('error', 404, 'text/html')
                elif command == 'UPDATE':
                    data = ''
                    exited_with_error = False

                    if not self.verify_credentials(username, password):
                        break

                    with open('contract_data.txt', 'r', encoding='utf8') as f:
                        raw_data = re.sub('\n{2,}', '\n', f.read())

                        data = raw_data.split('\n')

                        term, value = body[1:].split('=')

                        for i, row in enumerate(data):
                            print(row, term)
                            if row == term:
                                data[i] = value
                                break
                        else:
                            response = HTTPResponse('error', 501, 'text/plain')
                            exited_with_error = True

                    if not exited_with_error:
                        with open('contract_data.txt', 'w', encoding='utf8') as f:
                            f.write('\n'.join(data))
                            response = HTTPResponse('action-response', 200, 'text/plain')

                elif command == 'DELETE':
                    data = ''
                    exited_with_error = False

                    if not self.verify_credentials(username, password):
                        break

                    with open('contract_data.txt', 'r', encoding='utf8') as f:
                        raw_data = f.read()

                        data = raw_data.split('\n')

                        term = body[1:]

                        for i, row in enumerate(data):
                            if row == term:
                                del data[i]
                                break
                        else:
                            exited_with_error = True
                            response = HTTPResponse('error', 501, 'text/plain')

                    if not exited_with_error:
                        with open('contract_data.txt', 'w', encoding='utf8') as f:
                            f.write('\n'.join(data))
                            response = HTTPResponse('action-response', 200, 'text/plain')

                elif command == 'ADD':
                    data = ''

                    if not self.verify_credentials(username, password):
                        break

                    with open('contract_data.txt', 'r', encoding='utf8') as f:
                        raw_data = f.read()

                        data = raw_data.strip().split('\n')
                        data.append(body[1:])

                    with open('contract_data.txt', 'w+', encoding='utf8') as f:
                        f.write('\n'.join(data))

                    response = HTTPResponse('action-response', 200, 'text/plain')

                elif command == 'LOGIN':
                    if not self.verify_credentials(username, password):
                        break

                self.send_http_response(response)

            else:
                print('Done.')
                self.connection.close()
                break
