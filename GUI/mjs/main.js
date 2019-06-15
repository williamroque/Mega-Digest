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
    // Makes sure Python 3 is installed
    if (!shell.which('python3')) {
        console.log('Python 3 not installed');
        return;
    }

    // Execute python script and check for output status
    const spawn = require('child_process').spawn;
    const process = spawn('python3', args);

    process.on('exit', () => {
        console.log('FINISHED');
        if (willQuit) {
            app.relaunch();
            app.exit(0);
        }
    });

    process.stdout.on('data', output => {
        output = output.toString();
        if (output) {
            fileio.writeData(output, appData + '/Mega Paysage Digest/output.txt');
        }
    });
    process.on('error', err => console.log(err));
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
ipcMain.on('run-script', (event, path) => {
    const fileName = createSaveDialog();

    if (fileName && !configErrorScheduled) {
        runScript(false, [fileio.scriptFilePath, path, fileName]);
    }

    event.returnValue = 0;
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

    fileio.writeData(targetVersion, fileio.path + 'version.txt');

    event.returnValue = true;
});

// On request run python script with paths
ipcMain.on('attempt-update', (event, data) => {
    let [path, username, password] = data;

    const targetLength = 16;

    password += '='.repeat(targetLength - password.length);

    let willQuit = false;
    dialog.showMessageBox(null, {
        message: 'Restart application?',
        buttons: ['No', 'Yes'],
        defaultId: 1
    }, res => {
        if (res) willQuit = true;
    });
    runScript(willQuit, [fileio.installScriptPath, path, fileio.path, username, password]);

    event.returnValue = 0;
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

