import socket

host = '192.168.25.15'
port = 8888

BUFFER_SIZE = 2000

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((host, port))

mes = b'request_data'

data = ''

client.send(mes)

while True:
    rec_data = client.recv(BUFFER_SIZE).decode('utf-8')

    if rec_data[-4:] == 'exit':
        data += rec_data[:-4]
        break
    data += rec_data

data = data.strip()
print(data)

client.close()
