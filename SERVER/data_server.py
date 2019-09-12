import server

import data_client_thread

class DataServer(server.Server):
    def __init__(self, *args):
        super(DataServer, self).__init__(*args)

    def listen(self):
        while True and self.running:
            self.server.listen(4)
            (conn, (ip, port)) = self.server.accept()

            new_client_thread = data_client_thread.DataClientThread(conn, ip, port)
            new_client_thread.start()

            self.threads.append(new_client_thread)

        self.server.close()

        for thread in self.threads:
            thread.join()

        print('Data server closed.')

