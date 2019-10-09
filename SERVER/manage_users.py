import hashlib
import json
import os

import getpass

path = 'credentials.json'
data = {}

if os.path.exists(path):
    with open(path, 'r', encoding='utf8') as f:
        data = json.loads(f.read())

hash_password = lambda p: hashlib.sha256(p.encode('utf-8')).hexdigest()

def write_credentials():
    with open(path, 'w+', encoding='utf8') as f:
        f.write(json.dumps(data))

def is_valid(username, password):
    if username in data:
        if hash_password(password) == data[username]:
            return True
    return False

def add_user(username, password):
    if not username in data:
        password_hash = hash_password(password)
        data[username] = password_hash
        write_credentials()
    else:
        print('User already exists.')
        return 1

def remove_user(username, password):
    if is_valid(username, password):
        del data[username]
        write_credentials()
    else:
        print('Invalid username or password.')

command_options = [
    '1. Add user.',
    '2. Remove user.',
    '3. Validate credentials.',
    '4. Cancel.'
]

def get_command():
    for command in command_options:
        print(command)
    print()
    return input('> ')

def get_credentials():
    username = input('Username> ')
    while not username:
        username = input('Username> ')

    password = getpass.getpass(prompt='Password> ', stream=None)
    while not password:
        password = input('Password> ')

    return ( username, password )

if __name__ == '__main__':
    command = get_command()
    while True:
        if command == '4':
            break

        credentials = get_credentials()
        if command == '1':
            add_user(*credentials)
        elif command == '2':
            remove_user(*credentials)
        elif command == '3':
            if is_valid(*credentials):
                print('Valid credentials.')
            else:
                print('Invalid credentials.')

        print()
        command = get_command()
