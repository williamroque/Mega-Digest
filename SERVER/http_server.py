import server

import http_client_thread

class HTTPServer(server.Server):
    def __init__(self, *args):
        super(HTTPServer, self).__init__(*args)

    def listen(self):
        while True and self.running:
            self.server.listen(4)
            (conn, (ip, port)) = self.server.accept()

            new_client_thread = http_client_thread.HttpClientThread(conn, ip, port)
            new_client_thread.start()

            self.threads.append(new_client_thread)

        self.server.close()

        for thread in self.threads:
            thread.join()

        print('HTTP server closed.')

