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

// Setup file I/O module
const FileIO = require('./fileio');
fileio = new FileIO();
fileio.setup();

// Fix path after packaging
const fixPath = require('fix-path');
fixPath();

// Run digest Python script
const runScript = (path, oFile) => {
    // Makes sure Python 3 is installed
    if (!shell.which('python3')) {
        console.log('Python 3 not installed');
        return;
    }

    // Execute python script and check for output status
    const spawn = require('child_process').spawn;
    const process = spawn('python3', [fileio.scriptFilePath, path, oFile]);

    process.on('exit', () => {
        console.log('FINISHED');
    });

    process.stdout.on('data', output => {
        output = output.toString();
        if (output) {
            fileio.writeData(output, appData + '/Mega Paysage Digest/output.txt');
        }
    });
    process.on('error', err => console.log(err));
};


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
    if (fileName) runScript(path, fileName);
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

    mainWindowState.manage(mainWin.window);
};

// Create window when ready
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWin || mainWin.window === null) {
        mainWin = createWindow();
    }
});

