import threading

class DataClientThread(threading.Thread):
    def __init__(self, conn, ip, port):
        super().__init__()

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

                self.connection.close()
                print('Done.')
                break
            else:
                break

