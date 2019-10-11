import os
import re
import sys

is_xls = re.compile('\.xls$')
r_name = re.compile('(?<=r_car_boletim_recebimento_).*(?=.xls)')

input_dir = sys.argv[1]
output_dir = sys.argv[2]
for file in os.listdir(input_dir):
    file = re.sub('\s+', '_', file)
    if is_xls.search(file):
        name = r_name.search(file).group(0)
        os.system('python3 digest.py {} {}'.format('{}/{}'.format(input_dir, file), '{}/arquivo_retorno_{}.txt'.format(output_dir, name)))
