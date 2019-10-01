// Remote
const remote = require('electron').remote;

// For messages
const { dialog } = remote;

// File drag and drop elements
const boletimDrop = document.querySelector('#boletimWrapper');

// File input elements
const boletimInput = document.querySelector('#boletimInput');

// Run script button
const runScriptButton = document.querySelector('#runButton');

// Credentials prompt
const credentialsPrompt = document.querySelector('#credentialsPrompt');

// Crentials input
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

// Add package button
const packageButton = document.querySelector('#addPackageButton');

// Package file
let packageFilePath;

// Close window
const closeWindowButton = document.querySelector('#closeWindow');

// Attempt update
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

// Attempt update on button press
packageButton.addEventListener('click', attemptUpdate, false);

// Attempt update on press enter in password input
passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        attemptUpdate(); 
    }
}, false);

// Cancel package prompt when press escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        credentialsPrompt.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
    }
});

// Show credentials prompt
function showCredentialsPrompt() {
    credentialsPrompt.style.display = 'flex';
}

// File drag and drop

// Handle drag over event for boletim drop area
boletimDrop.addEventListener('dragover', e => {
    e.preventDefault();

    // Change background to grey when file hovers over
    boletimDrop.style.background = '#CCC';
    boletimInput.style.background = '#CCC';
}, false);

// Handle drop event for boletim drop area
boletimDrop.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    // Sets file input to file if extension is .xls or .xlsx
    const file = e.dataTransfer.files[0].path;
    if (/\.xls$|\.xlsx$/.test(file)) {
        boletimInput.innerText = file;
    } else if (/\.dpf$/.test(file)) {
        packageFilePath = file;
        if (requestIsValidVersion(file)) {
            showCredentialsPrompt();
        }
    }

    // Reset drop area background color
    boletimDrop.style.background = '#FFF';
    boletimInput.style.background = '#FFF';
}, false);

// Handle drag leave event for boletim drop area
boletimDrop.addEventListener('dragleave', e => {
    e.preventDefault();

    // Reset drop area background color
    boletimDrop.style.background = '#FFF';
    boletimInput.style.background = '#FFF';
}, false);

// File input

// Trigger on input click
boletimInput.addEventListener('click', _ => {
    // Request file dialog from main process
    const value = requestOpenDialog();

    // If value is not undefined, set boletimInput to return value
    if (value)
        boletimInput.innerText = value[0];
}, false);

// Run script on button click
runScriptButton.addEventListener('click', _ => {
    const bPath = boletimInput.innerText;

    if (!bPath) return;

    requestRunScript(bPath);
}, false);

// Close window on click button
closeWindowButton.addEventListener('click', _ => {
    const window = remote.getCurrentWindow();
    window.close();
});
