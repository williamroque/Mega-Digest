const { ipcRenderer } = require('electron');

function requestOpenDialog() {
    return ipcRenderer.sendSync('get-open-dialog');
}

function requestRunScript(path) {
    ipcRenderer.sendSync('run-script', path);
}

function requestIsValidVersion(path) {
    return ipcRenderer.sendSync('is-valid-version', path);
}

function requestAttemptUpdate(...args) {
    ipcRenderer.sendSync('attempt-update', args);
}
