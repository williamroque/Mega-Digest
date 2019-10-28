import sys
import json

package = read_data(sys.argv[1])
dump_directory = sys.argv[2]

local_version = 0
version_path = dump_directory + 'version.txt'

if os.path.exists(version_path):
    with open(version_path, 'r', encoding='utf8') as f:
        local_version = f.read().replace('.', '')

version = package['v_id'].replace('.', '')

if int(local_version) > int(version):
    sys.exit(0)

script = package['script']
with open(dump_directory + 'digest.py', 'w+', encoding='utf8') as f:
    f.write(script)
