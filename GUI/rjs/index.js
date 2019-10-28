const remote = require('electron').remote;

const { dialog } = remote;

const boletimDrop = document.querySelector('#boletimWrapper');

const boletimInput = document.querySelector('#boletimInput');

const runScriptButton = document.querySelector('#runButton');

let packageFilePath;

const closeWindowButton = document.querySelector('#closeWindow');

function attemptUpdate() {
    returnCode = requestAttemptUpdate(packageFilePath) || 0;

    if (returnCode === 1) {
        alert('Python3 not installed');
    }
}

boletimDrop.addEventListener('dragover', e => {
    e.preventDefault();

    boletimDrop.style.background = '#CCC';
    boletimInput.style.background = '#CCC';
}, false);

boletimDrop.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    const excelTest = /\.xls$|\.xlsx$/;
    const dpfTest = /\.dpf$/;

    const files = [...e.dataTransfer.files].map(file => file.path).filter(file => excelTest.test(file) || dpfTest.test(file));

    if (files.length === 1) {
        const file = files[0];

        if (excelTest.test(file)) {
            boletimInput.innerText = file;
        } else {
            packageFilePath = file;
            if (requestIsValidVersion(file)) {
                attemptUpdate();
            }
        }
    } else if (files.length > 1) {
        const fileMatch = /(?<=r_car_boletim_recebimento_).*(?=.xls)/;

        const fileList = files.filter(file => fileMatch.test(file));
        if (fileList.length) {
            const outputPath = requestSaveDialog('folder');
            fileList.forEach(file => {
                requestRunScript(file, `${outputPath}/arquivo_retorno_${file.match(fileMatch)}.txt`);
            });
        }
    }

    boletimDrop.style.background = '#FFF';
    boletimInput.style.background = '#FFF';
}, false);

boletimDrop.addEventListener('dragleave', e => {
    e.preventDefault();

    boletimDrop.style.background = '#FFF';
    boletimInput.style.background = '#FFF';
}, false);

boletimInput.addEventListener('click', _ => {
    const value = requestOpenDialog();

    if (value)
        boletimInput.innerText = value[0];
}, false);

runScriptButton.addEventListener('click', _ => {
    const bPath = boletimInput.innerText;

    if (!bPath) return;

    requestRunScript(bPath, requestSaveDialog('file'));
}, false);

closeWindowButton.addEventListener('click', _ => {
    const window = remote.getCurrentWindow();
    window.close();
});
