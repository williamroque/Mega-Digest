// File select dialog
const { dialog } = require('electron');

// Remote
const remote = require('electron').remote;

// File drag and drop elements
const boletimDrop = document.querySelector('#boletimWrapper');

// File input elements
const boletimInput = document.querySelector('#boletimInput');

// Run script button
const runScriptButton = document.querySelector('#runButton');

// Close window
const closeWindowButton = document.querySelector('#closeWindow');

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
    if (/\.xls$|\.xlsx$/.test(file))
        boletimInput.innerText = file;

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
