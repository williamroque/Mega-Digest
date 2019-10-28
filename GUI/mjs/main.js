const { app, dialog } = require('electron');

const windowStateKeeper = require('electron-window-state');
const appData = app.getPath('appData');

const { ipcMain } = require('electron');

const shell = require('shelljs');
const nShell = require('electron').shell;

const outputPath = appData + '/Mega Paysage Digest/output.txt';

const fs = require('fs');
fs.writeFileSync(outputPath, '');

const FileIO = require('./fileio');
fileio = new FileIO();
fileio.setup();

const path = require('path');

let configErrorScheduled = false;

if (!fileio.configSet) configErrorScheduled = true;

const fixPath = require('fix-path');
fixPath();

function runScript(willQuit, args) {
    return new Promise(resolve => {
        if (!shell.which('python3')) {
            console.log('Python 3 not installed');
            resolve(1);
        }

        const spawn = require('child_process').spawn;
        const process = spawn('python3', args);

        process.stdout.on('data', output => {
            output = output.toString();

            if (output) {
                fs.appendFileSync(outputPath, `\n--- ${path.basename(args[1])} ---\r\n${output}`);
                nShell.openItem(outputPath);
            }
        });

        process.stdout.on('error', err => {
            console.log('Error:', err);
        });

        process.on('exit', () => {
            console.log('FINISHED');
            if (willQuit) {
                dialog.showMessageBox(null, {
                    message: 'Restart application?',
                    buttons: ['No', 'Yes'],
                    defaultId: 1
                }, res => {
                    if (res === 1) {
                        app.relaunch();
                        app.exit(0);
                    }
                });
            }
            resolve(0);
        });
    });
}

ipcMain.on('clear-output', event => {
    fs.writeFileSync(outputPath, '');
    event.returnValue = 0;
});

ipcMain.on('get-open-dialog', (event, _) => {
    event.returnValue = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel', extensions: ['xls', 'xlsx'] }
        ]
    });
});

ipcMain.on('get-save-dialog', (event, type) => {
    if (type === 'file') {
        event.returnValue = dialog.showSaveDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text', extensions: ['txt'] }
            ]
        });
    } else {
        event.returnValue = dialog.showOpenDialog({ properties: ['openDirectory'] });
    }
});

ipcMain.on('run-script', async (event, path, fileName) => {
    let returnCode = 0;

    if (fileName && !configErrorScheduled) {
        returnCode = await runScript(false, [fileio.scriptFilePath, path, fileName]);
    }

    event.returnValue = returnCode;
});

ipcMain.on('is-valid-version', (event, path) => {
    const parsedData = JSON.parse(fileio.readData(path));
    const targetVersion = parsedData.v_id.replace(/\./g, '') | 0;

    let currentVersion = 0;
    if (fileio.pathExists(fileio.path + 'version.txt')) {
        currentVersion = fileio.readData(fileio.path + 'version.txt').toString().replace(/\./g, '') | 0;
    }

    if (currentVersion >= targetVersion) {
        event.returnValue = false;
        return;
    }

    event.returnValue = true;
});

ipcMain.on('attempt-update', async (event, data) => {
    let path = data;

    let returnCode = await runScript(true, [fileio.installScriptPath, path, fileio.path]).catch(err=>console.log(err));

    if (returnCode === 0) {
        const packageData = JSON.parse(fileio.readData(path));
        const targetVersion = packageData['v_id'];
        fileio.writeData(targetVersion, fileio.path + 'version.txt');
    }

    event.returnValue = returnCode;
});

const Window = require('./window');

const mainWinObject = {
    center: true,
    icon: '../assets/icon.png',
    frame: false,
    transparent: true,
    backgroundColor: '#fff',
    minWidth: 890,
    minHeight: 610,
    maxWidth: 1150,
    maxHeight: 770,
    fullscreen: false,
};

let mainWin;

const createWindow = () => {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1150,
        defaultHeight: 750
    });

    mainWinObject.width = mainWindowState.width;
    mainWinObject.height = mainWindowState.height;

    mainWin = new Window(mainWinObject);
    
    if (configErrorScheduled) {
        dialog.showMessageBox(null, {
            message: 'Configuration not set.',
        });
    }

    mainWindowState.manage(mainWin.window);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.exit(0);
    }
});

app.on('activate', () => {
    if (!mainWin || mainWin.window === null) {
        mainWin = createWindow();
    }
});

