const { ipcRenderer } = require('electron');

function requestOpenDialog() {
    return ipcRenderer.sendSync('get-open-dialog');
}

function requestSaveDialog(type) {
    return ipcRenderer.sendSync('get-save-dialog', type);
}

function requestRunScript(path, outputFile) {
    return ipcRenderer.sendSync('run-script', path, outputFile);
}

function requestIsValidVersion(path) {
    return ipcRenderer.sendSync('is-valid-version', path);
}

function requestAttemptUpdate(...args) {
    return ipcRenderer.sendSync('attempt-update', args);
}
