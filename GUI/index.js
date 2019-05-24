// File select dialog
const { dialog } = require('electron');

// Remote
const remote = require('electron').remote;

// File drag and drop elements
const boletimDrop = document.querySelector('#boletimWrapper');
const saldoDrop = document.querySelector('#saldoWrapper');

// File input elements
const boletimInput = document.querySelector('#boletimInput');
const saldoInput = document.querySelector('#saldoInput');

// Run script button
const runScriptButton = document.querySelector('#run-button');

// Close window
const closeWindowButton = document.querySelector('#close-window');

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

// Handle drag over event for saldo drop area
saldoDrop.addEventListener('dragover', e => {
    e.preventDefault();

    // Change background to grey when file hovers over
    saldoDrop.style.background = '#CCC';
    saldoInput.style.background = '#CCC';
}, false);

// Handle drop event for saldo drop area
saldoDrop.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    // Sets file input to file if extension is .xls or .xlsx
    const file = e.dataTransfer.files[0].path;
    if (/\.xls$|\.xlsx$/.test(file))
        saldoInput.innerText = file;

    // Reset drop area background color
    saldoDrop.style.background = '#FFF';
    saldoInput.style.background = '#FFF';
}, false);

// Handle drag leave event for saldo drop area
saldoDrop.addEventListener('dragleave', e => {
    e.preventDefault();

    // Reset drop area background color
    saldoDrop.style.background = '#FFF';
    saldoInput.style.background = '#FFF';
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

// Trigger on input click
saldoInput.addEventListener('click', _ => {
    // Request file dialog from main process
    const value = requestOpenDialog();
    //
    // If value is not undefined, set boletimInput to return value
    if (value)
        saldoInput.innerText = value[0];
}, false);

// Run script on button click
runScriptButton.addEventListener('click', _ => {
    const bPath = boletimInput.innerText;
    const sPath = saldoInput.innerText;

    if (!bPath || !sPath)
        return;

    requestRunScript([bPath, sPath]);
}, false);

// Close window on click button
closeWindowButton.addEventListener('click', _ => {
    const window = remote.getCurrentWindow();
    window.close();
});
