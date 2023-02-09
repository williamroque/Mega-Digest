const { spawn } = require('child_process');

const subprocess = spawn('python', ['main.py']);

const input = {
    'planilha-extrato': '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Extrato.xls',
    'planilhas-francesinha': [
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_01.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_02.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_05.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_06.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_07.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_08.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_09.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_12.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_13.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_14.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_15.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_16.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_19.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_20.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_21.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_22.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_23.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_26.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_27.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_28.12.22.xls',
        '/Users/jetblack/Documents/Work/Ethos/Mega/mega-paysage-digest/merge/samples/Francesinhas/LON_29.12.22.xls',
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
