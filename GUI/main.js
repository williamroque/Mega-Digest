// Electron app import
const { app, dialog } = require('electron');

// Get appdata path
const appData = app.getPath('appData');

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
const runScript = (bPath, sPath, oFile) => {
    // Makes sure Python 3 is installed
    if (!shell.which('python3')) {
        console.log('Python 3 not installed');
        return;
    }

    // Execute python script and check for output status
    const spawn = require('child_process').spawn;
    const process = spawn('python3', [fileio.scriptFilePath, bPath, sPath, oFile]);

    process.on('error', err => console.log(err));
};

// Interprocess communication
const { ipcMain } = require('electron');

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
ipcMain.on('run-script', (event, paths) => {
    const fileName = createSaveDialog();
    if (fileName) runScript(...paths, fileName);
    event.returnValue = 0;
});

// Window class import
const Window = require('./window');

// Main window properties
const mainWinObject = {
    width: 1150,
    height: 750,
    center: true,
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
const createWindow = () => mainWin = new Window(mainWinObject);

// Create window when ready
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWin.window === null) {
        mainWin = createWindow();
    }
});

