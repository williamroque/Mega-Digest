import socket
import data_client_thread

class Server():
    def __init__(self, ip, port):
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server.bind((ip, port))

        self.threads = []

    def listen(self, awake):
        while True and awake.is_set():
            self.server.listen(4)
            (conn, (ip, port)) = self.server.accept()

            new_client_thread = data_client_thread.DataClientThread(conn, ip, port)
            new_client_thread.start()

            self.threads.append(new_client_thread)

        for thread in self.threads:
            thread.join()

