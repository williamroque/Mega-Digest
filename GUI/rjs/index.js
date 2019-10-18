const remote = require('electron').remote;

const { dialog } = remote;

const boletimDrop = document.querySelector('#boletimWrapper');

const boletimInput = document.querySelector('#boletimInput');

const runScriptButton = document.querySelector('#runButton');

const credentialsPrompt = document.querySelector('#credentialsPrompt');

const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

const packageButton = document.querySelector('#addPackageButton');

let packageFilePath;

const closeWindowButton = document.querySelector('#closeWindow');

function attemptUpdate() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    const targetLength = 16;

    let returnCode = 0;
    
    if (username && password && (password.length <= targetLength)) {
        returnCode = requestAttemptUpdate(packageFilePath, username, password);
    }

    if (returnCode === 0) {
        credentialsPrompt.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
    } else if (returnCode === 1) {
        alert('Python not installed');
    } else if (returnCode === 2) {
        alert('Incorrect username or password');
    }
}

packageButton.addEventListener('click', attemptUpdate, false);

passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        attemptUpdate(); 
    }
}, false);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        credentialsPrompt.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
    }
});

function showCredentialsPrompt() {
    credentialsPrompt.style.display = 'flex';
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
                showCredentialsPrompt();
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
