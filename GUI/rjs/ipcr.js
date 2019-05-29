const { ipcRenderer } = require('electron');

function requestOpenDialog() {
    return ipcRenderer.sendSync('get-open-dialog');
}

function requestRunScript(paths) {
    ipcRenderer.sendSync('run-script', paths);
}
