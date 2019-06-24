import threading

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

        self.ip = ip
        self.port = port
        self.connection = conn

        print('Thread started for client {} at port {}'.format(ip, port))

    def run(self):
        while True:
            mes = self.connection.recv(1024)

            if mes == b'request_data':
                with open('data/contract_data.txt', 'r') as f:
                    contract_data = f.read()
                    self.connection.send(contract_data.encode('utf-8'))
                    self.connection.send(b'exit')

                print('Thread ended for client {} at port {}'.format(self.ip, self.port))
                break

