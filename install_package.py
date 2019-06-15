# For script call and signal handling
import sys
import os

# For data handling
import json

# For encryption/decryption
from base64 import urlsafe_b64encode, urlsafe_b64decode
from Crypto.Cipher import AES
from Crypto import Random

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
        return s + pad_length * chr(pad_length).decode('utf-8')

# Remove padding relative to type (base64 or hexadecimal)
def unpad(s, is_b64):
    if is_b64:
        return s.rstrip('=')
    else:
        pad_length = s[-1]
        return s[:-pad_length]

# AES decryption based on key
def decrypt(mes, key):
    decoded_mes = urlsafe_b64decode(pad(mes, True))
    iv = decoded_mes[:BS]
    encrypted_mes = decoded_mes[BS:]
    cipher = AES.new(key, AES.MODE_CFB, iv, segment_size=AES.block_size * 8)
    return unpad(cipher.decrypt(encrypted_mes), False)

# Get command line arguments
package = read_data(sys.argv[1])
dump_directory = sys.argv[2]

username = sys.argv[3]
password = sys.argv[4]

if not os.path.exists(dump_directory):
    os.mkdir(dump_directory)

local_version = 0
version_path = dump_directory + 'version.txt'

# Verify that the current version is less than update version
if os.path.exists(version_path):
    with open(version_path, 'r') as f:
        local_version = f.read().replace('.', '')

version = package['v_id'].replace('.', '')

if int(local_version) > int(version):
    sys.exit(0)

# Decrypt and write package data
keys = package['keys']
global_key = decrypt(keys[username], password)

if 'script' in package:
    script = decrypt(package['script'], global_key)
    with open(dump_directory + 'digest.py', 'w+') as f:
        f.write(script.decode('utf-8'))

if 'cdata' in package:
    cdata = decrypt(package['cdata'], global_key)
    with open(dump_directory + 'contract_data.txt', 'w+') as f:
        f.write(cdata.decode('utf-8'))
