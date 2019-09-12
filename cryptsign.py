# For script call and signal handling
import sys
import signal

# For randomness
import os

# For password input
import getpass

# For data handling
import json

# For encryption/decryption
from base64 import urlsafe_b64encode, urlsafe_b64decode
from Crypto.Cipher import AES
from Crypto import Random

# Handle SIGINT (^C)
def handle_sigint(*_):
    sys.exit(0)

# Path for target data file
user_data_path = ''

# Get user data file path
def get_data_path(is_user_data=True):
    global user_data_path
    if is_user_data and user_data_path != '':
        return user_data_path
    elif is_user_data and len(sys.argv) > 1:
        return sys.argv[1]
    else:
        user_data_path = input('Enter path: ')
        return user_data_path

# Read data from path and output as dictionary
def read_data(path):
    data = {}
    try:
        with open(path, 'r') as f:
            raw_data = f.read()
            data = json.loads(raw_data)
    except IOError:
        pass
    return data

# Convert dictionary to string and write to path
def write_data(data, path):
    data = json.dumps(data)
    return_value = 0

    try:
        with open(path, 'w+') as f:
            f.write(data)
    except IOError as error:
        return_value = 1
        print('Could not write file', path, 'due to', error)

    return return_value

# Block size
BS = 16

# Create padding relative to type (base64 or hexadecimal)
def pad(s, is_b64):
    if type(s) != bytes:
        s = s.encode('utf-8')
    if is_b64:
        pad_length = 4 - len(s) % 4
        return s + pad_length * b'='
    else:
        pad_length = BS - len(s) % BS
        return s + pad_length * chr(pad_length).encode('utf-8')

# Remove padding relative to type (base64 or hexadecimal)
def unpad(s, is_b64):
    s = s.decode('utf-8')
    if is_b64:
        return s.rstrip('=')
    else:
        pad_length = ord(s[len(s) - 1])
        return s[:-pad_length]

# AES encryption based on key
def encrypt(mes, key):
    iv = Random.new().read(BS)
    cipher = AES.new(key, AES.MODE_CFB, iv, segment_size=AES.block_size * 8)
    encrypted_mes = cipher.encrypt(pad(mes, False))
    return unpad(urlsafe_b64encode(iv + encrypted_mes), True)

# AES decryption based on key
def decrypt(mes, key):
    decoded_mes = urlsafe_b64decode(pad(mes, True))
    iv = decoded_mes[:BS]
    encrypted_mes = decoded_mes[BS:]
    cipher = AES.new(key, AES.MODE_CFB, iv, segment_size=AES.block_size * 8)
    return unpad(cipher.decrypt(encrypted_mes), False)

# Master password for encryption of user passwords
master_password = ''

# Load master password to memory for repeated use
def load_password(password):
    global master_password
    master_password = password

# Get master password whether it is set or not
def get_password(is_master, is_confirm=False):
    global master_password

    if is_master and master_password != '':
        return master_password
    else:
        password = ''
        while len(password) > 16 or len(password) < 1:
            if not is_confirm:
                print('\nPassword must be longer than 1 character and shorter than 17')
            else:
                print('Confirm password')
            password = getpass.getpass(prompt='Enter password: ', stream=None)
        password = password + (16 - len(password)) * '='
        if is_confirm or password == get_password(False, True):
            return password
        else:
            return get_password(False)

    print()

# Add user to list of recipients (AES encrypted password)
def create_target(username, password):
    user_data_path = get_data_path()
    user_data = read_data(user_data_path)

    master_password = get_password(True)

    user_data[username] = encrypt(password, master_password)
    write_data(user_data, user_data_path)

# Remove user from list of recipients
def remove_target(username):
    user_data_path = get_data_path()
    user_data = read_data(user_data_path)
    if input('Are you sure you want to delete ' + username + '? (Yes/.) '):
        del user_data[username]
    write_data(user_data, user_data_path)

# Generate encrypted package
def generate_package():
    global_key = os.urandom(16)

    data = {}
    data['v_id'] = input('Enter version ID: ')

    keys = read_data(get_data_path())
    output_keys = {}

    master_key = get_password(True)

    for key in keys:
        decrypted_key = decrypt(keys[key], master_key.encode('utf-8'))
        output_keys[key] = [encrypt(global_key, decrypted_key.encode('utf-8')), encrypt('test123', decrypted_key.encode('utf-8'))]

    data['keys'] = output_keys

    if input('Update script? (.../n) ') != 'n':
        with open('./digest.py', 'r') as f:
            plaintext = f.read()
            data['script'] = encrypt(plaintext, global_key)
    if input('Update contract data? (.../n) ') != 'n':
        with open('./contract_data.txt', 'r') as f:
            plaintext = f.read()
            data['cdata'] = encrypt(plaintext, global_key)

    print('Enter output path')
    path = get_data_path(False)

    if path[-3:] != 'dpf':
        path += '.dpf'

    write_data(data, path)

# Main function
def main():

    # Available commands
    commands = [
        'Create target',
        'Remove target',
        'Load password',
        'Dump passwords',
        'Generate package',
        'Cancel'
    ]

    # Handle SIGINT
    signal.signal(signal.SIGINT, handle_sigint)

    # List available commands
    for i, command in enumerate(commands):
        print(str(i) + '.', command)

    # Command prompt
    command = input('> ')

    # Try to convert command to int and test if command is within range
    try:
        command = int(command)
        if command >= len(commands) or command < 0:
            raise ValueError
    except ValueError:
        print('\nInvalid command')
        return

    # Command switch
    if command == 0:
        print('\nCREATE TARGET\n')
        username = input('Username: ')
        password = get_password(False)
        create_target(username, password)
    elif command == 1:
        print('\nREMOVE TARGET\n')
        username = input('Username: ')
        remove_target(username)
    elif command == 2:
        print('\nLOAD PASSWORD\n')
        load_password(get_password(False))
    elif command == 3:
        print('\nDUMP\n')
        if input('Are you sure? (Yes/...) ') == 'Yes':
            key = get_password(True)
            data = read_data(get_data_path())
            for user in data:
                plain_password = decrypt(data[user], key.encode('utf-8'))
                print(user, plain_password)
    elif command == 4:
        print('\nGENERATE PACKAGE\n')
        generate_package()

    elif command == 5:
        sys.exit(0)

# Control loop
while True:
    main()
    print()

