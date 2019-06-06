const { ipcRenderer } = require('electron');

function requestOpenDialog() {
    return ipcRenderer.sendSync('get-open-dialog');
}

function requestRunScript(path) {
    ipcRenderer.sendSync('run-script', path);
}
