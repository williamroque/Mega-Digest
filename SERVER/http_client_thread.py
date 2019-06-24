import threading

class HttpClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            if mes:
                print(mes)
            else:
                break
