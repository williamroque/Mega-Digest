// Electron app import
const { app, dialog } = require('electron');

// Save window size
const windowStateKeeper = require('electron-window-state');

// Get appdata path
const appData = app.getPath('appData');

// Interprocess communication
const { ipcMain } = require('electron');

// Python communication
const shell = require('shelljs');

// Native shell for file opening
const nShell = require('electron').shell;

// Set up file I/O module
const FileIO = require('./fileio');
fileio = new FileIO();
fileio.setup();

let configErrorScheduled = false;

if (!fileio.configSet) configErrorScheduled = true;

// Fix path after packaging
const fixPath = require('fix-path');
fixPath();

// Run Python script
function runScript(willQuit, args) {
    return new Promise(resolve => {
        // Makes sure Python 3 is installed
        if (!shell.which('python3')) {
            console.log('Python 3 not installed');
            resolve(1);
        }

        // Execute python script and check for output status
        const spawn = require('child_process').spawn;
        const process = spawn('python3', args);

        process.stdout.on('data', output => {
            output = output.toString();

            if (output) {
                if (output.trim() === 'username_error' || output.trim() === 'password_error') {
                    willQuit = false;
                    resolve(2);
                } else {
                    const outputPath = appData + '/Mega Paysage Digest/output.txt';

                    fileio.writeData(output, outputPath);
                    nShell.openItem(outputPath);
                }
            }
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

        process.on('error', err => console.log(err));
    });
}

// Create file select dialog
const createSelectDialog = () => dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
        { name: 'Excel', extensions: ['xls', 'xlsx'] }
    ]
});

// Create file save dialog
const saveDialogOptions = {
    title: 'Save',
    filters: [
        { name: 'Text File', extensions: ['txt'] }
    ]
};
const createSaveDialog = () => dialog.showSaveDialog(null, saveDialogOptions);

// On request file dialog
ipcMain.on('get-open-dialog', (event, _) => {
    event.returnValue = createSelectDialog();
});

// On request run python script with paths
ipcMain.on('run-script', async (event, path) => {
    const fileName = createSaveDialog();

    let returnCode = 0;

    if (fileName && !configErrorScheduled) {
        returnCode = await runScript(false, [fileio.scriptFilePath, path, fileName]);
    }

    event.returnValue = returnCode;
});

// On request version test
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

// On request run python script with paths
ipcMain.on('attempt-update', async (event, data) => {
    let [path, username, password] = data;

    const targetLength = 16;

    password += '='.repeat(targetLength - password.length);

    let returnCode = await runScript(true, [fileio.installScriptPath, path, fileio.path, username, password]).catch(err=>console.log(err));

    if (returnCode === 0) {
        const packageData = JSON.parse(fileio.readData(path));
        const targetVersion = packageData['v_id'];
        fileio.writeData(targetVersion, fileio.path + 'version.txt');
    }

    event.returnValue = returnCode;
});

// Window class import
const Window = require('./window');

// Main window properties
const mainWinObject = {
    center: true,
    icon: '../assets/icon.png',
    frame: false,
    minWidth: 890,
    minHeight: 610,
    maxWidth: 1150,
    maxHeight: 770,
    fullscreen: false,
};

// Main window
let mainWin;

// Create main window as Window object 
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

// Create window when ready
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

