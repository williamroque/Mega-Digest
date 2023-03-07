const { spawn } = require('child_process');

const subprocess = spawn('python', ['main.py']);

const input = {
    'planilhas-extrato': [
        '../samples/Extratos/BRENA LORENA MONTEIRO MOURA - VILA PRIMAVERA QD 837 LT 105.xls',
        '../samples/Extratos/ADRIANO BARBOSA DA SILVA - QD 844 LT 145.xls'
    ],
    'planilhas-francesinha': [
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 17.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 03.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 30.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 11.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 VPRIMAVERA - 01.23 - Consolidada.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 23.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 31.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 04.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 10.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 20.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 13.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 26.01.23.xls',
        '../samples/Francesinhas/01. JANEIRO/2589-5 FRANCESA - 06.01.23.xls'
    ],
    'output-path': '/Users/jetblack/Desktop/output.xlsx'
};

subprocess.stdin.write(JSON.stringify(input));
subprocess.stdin.end();

subprocess.stderr.on('data', err => {
    console.log(err.toString());
});

subprocess.stdout.on('data', out => {
    console.log(out.toString());
});
