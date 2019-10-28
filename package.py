import json

data = {}
version = input('Enter version ID: ')

data['v_id'] = version

with open('./digest.py', 'r') as f:
    data['script'] = f.read()

path = 'digest_v{}.dpf'.format(version)

with open(path, 'w+') as f:
    f.write(json.dumps(data))

