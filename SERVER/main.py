import data_server
import http_server
import threading
import signal
import sys

# IP for servers
ip = '0.0.0.0'

# Port for data server
data_port = 8888

# Awake event for thread lifetime tracking
awake = threading.Event()
awake.set()

# Server class implemented in data_server module
data_server = data_server.Server(ip, data_port)

# Start thread for data_server.listen method
data_server_thread = threading.Thread(target=data_server.listen, args=(awake,))
data_server_thread.start()

# Port for HTTP server
http_port = 80

# Server class implemented in http_server module
http_server = http_server.Server(ip, http_port)

# Start thread for http_server.listen method
http_server_thread = threading.Thread(target=http_server.listen, args=(awake,))
http_server_thread.start()

# Shutdown server gracefully
def shutdown_server(sig, frame):
    print('Shutting down server.')
    data_server.server.close()
    http_server.server.close()

    awake.clear()

    data_server_thread.join()
    http_server_thread.join()

# Handle SIGINT (Ctrl-c)
signal.signal(signal.SIGINT, shutdown_server)
