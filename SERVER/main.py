import data_server
import http_server

import threading
import socket

import signal
import sys

# IP for servers
ip = '0.0.0.0'

# Port for data server
data_port = 8888

# Server class implemented in data_server module
data_server = data_server.DataServer(ip, data_port)

# Start thread for data_server.listen method
data_server_thread = threading.Thread(target=data_server.listen)
data_server_thread.start()

# Port for HTTP server
http_port = 80

# Server class implemented in http_server module
http_server = http_server.HTTPServer(ip, http_port)

# Start thread for http_server.listen method
http_server_thread = threading.Thread(target=http_server.listen)
http_server_thread.start()

def self_connect(port):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((ip, port))
    client.close()

# Shutdown server gracefully
def shutdown_server(sig, frame):
    print('\nShutting down server.\n')

    data_server.running = False
    http_server.running = False

    self_connect(data_port)
    self_connect(http_port)

    data_server_thread.join()
    http_server_thread.join()

# Handle SIGINT (Ctrl-c)
signal.signal(signal.SIGINT, shutdown_server)
