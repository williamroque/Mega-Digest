// Search through data
const searchTermElement = document.querySelector('#search-term');
let isFocused = false;

const currentSearchByElement = document.querySelector('#current-search-by');
const searchByListElement = document.querySelector('#search-by-list');
const searchByListItems = document.querySelectorAll('.search-by-list-item');

// Contract data table element
const contractDataTBodyElement = document.querySelector('#contract-table-body');

// Blocking prompt element
const blockingPromptElement = document.querySelector('#blocking-prompt');

// Method for letting CSS know that the blocking prompt is visible
const blockingPromptVisibleElement = document.querySelector('#blocking-prompt-visible');

// Edit/delete prompt
const managePromptElement = document.querySelector('#manage-prompt');

// Edit/delete prompt buttons
const editButtonElement = document.querySelector('#edit-button');
const deleteButtonElement = document.querySelector('#delete-button');

// Add contract button
const addButtonElement = document.querySelector('#add-button');

// Login elements
const loginOverlay = document.querySelector('#login-overlay');

const usernameInput = document.querySelector('#username');
const usernameLabel = document.querySelector('#username-label');

const passwordInput = document.querySelector('#password');
const passwordLabel = document.querySelector('#password-label');

const loginButton = document.querySelector('#submit-login');

// Keep track of blocking prompt visibility
let isAddingContract = false;

// Keep track of search by term option list
let searchByListExpanded = false;

// Keep track of data
let data = [];
let dataRenderBuffer = [];

// Edit/delete prompt
let managePromptVisible = false;

// Currently selected row
let currentRow;
let currentRowElement;

// Currently selected row values before editing
let currentRowValues;

// Determine whether the user is editing a row
let isEditing;

// Keep track of current search by term option
let currentSearchByItem = searchByListElement.childNodes[1];

// Send and receive HTTP requests to and from the server
function contactServer(requestType, request) {
    let credentials = localStorage.getItem('credentials');
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4) {
                resolve(xhttp.responseText);
            }
        };

        xhttp.open(requestType, `${request}|${credentials}`);

        try {
            xhttp.send();
        } catch(e) {
            reject(e);
        }
    });

}

// Show blocking prompt with a message
function showBlockingPrompt(body) {
    blockingPromptVisibleElement.checked = true;

    blockingPromptElement.appendChild(body);

    blockingPromptElement.style.display = 'flex';
}

// Hide blocking prompt
function hideBlockingPrompt() {
    blockingPromptVisibleElement.checked = false;

    isAddingContract = false;

    clearChildren(blockingPromptElement);

    blockingPromptElement.style.display = 'none';
}

// Halt page if the connection is lost
function connectionHalt() {
    const errorMessage = document.createTextNode( 'N\u00E3o foi poss\u00EDvel se comunicar com o servidor. Por favor, verifique sua conex\u00E3o.');
    
    document.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    blockingPromptElement.setAttribute('class', 'halted');

    showBlockingPrompt(errorMessage);
}

// Remove obsolete children
function clearChildren(node) {
    let firstChild;
    while (firstChild = node.firstChild)
        node.removeChild(firstChild);
}

function addRow(row) {
    const [unidade, contrato, documento, nome, quadra] = row;

    data.push({
        'Unidade': unidade,
        'N. Contrato': contrato,
        'CPF/CNPJ': documento,
        'Nome': nome,
        'Quadra': quadra
    });
}

// Show add prompt on add button press
addButtonElement.addEventListener('click', e => {
    e.stopPropagation();

    isAddingContract = true;

    const table = document.createElement('TABLE');
    table.setAttribute('id', 'add-table');

    const headerRow = document.createElement('TR');
    const headers = ['Unidade', 'N. Contrato', 'CPF/CNPJ', 'Nome', 'Quadra'];

    headers.forEach(header => {
        const headerElement = document.createElement('TH');
        const headerText = document.createTextNode(header);

        headerElement.setAttribute('class', 'add-table-header');

        headerElement.appendChild(headerText);
        headerRow.appendChild(headerElement);
    });

    table.appendChild(headerRow);

    const inputRow = document.createElement('TR');
    
    headers.forEach(_ => {
        const columnElement = document.createElement('TD');
        const inputElement = document.createElement('INPUT');
        
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('class', 'add-input');

        inputElement.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const columns = document.querySelectorAll('.add-input');

                let dataRow = [];
                for (let i = 0; i < columns.length; i++) {
                    let column = columns[i].value;

                    dataRow.push(column);
                }

                contactServer('ADD', dataRow.join(';')).then(() => {
                    const rowElement = document.createElement('TR');
                    rowElement.setAttribute('class', 'contract-table-row');

                    addRow(dataRow);

                    dataRow.forEach(column => {
                        const columnElement = document.createElement('TD');
                        const columnText = document.createTextNode(column);

                        columnElement.appendChild(columnText);
                        rowElement.appendChild(columnElement);

                        rowElement.addEventListener('click', handleRowClick, false);
                    });

                    contractDataTBodyElement.prepend(rowElement);
                    hideBlockingPrompt();
                }).catch(() => {
                    connectionHalt();
                });
            }
        }, false);

        columnElement.appendChild(inputElement);
        inputRow.appendChild(columnElement);
    });

    table.appendChild(inputRow);

    showBlockingPrompt(table);
}, false);

// Replace update inputs with table columns
function leaveEditingMode(columns) {
    isEditing = false;
    currentRowElement.childNodes.forEach((column, i) => {
        const text = document.createTextNode(columns[i]);

        clearChildren(column);
        column.appendChild(text);
    });
}

// Event listeners for the manage prompt buttons
editButtonElement.addEventListener('click', e => {
    // Change columns to inputs and send an HTTP request detailing update data if anything was changed
    isEditing = true;

    currentRowValues = [];
    const columnNodes = currentRowElement.childNodes;

    columnNodes.forEach(node => {
        const input = document.createElement('INPUT');

        input.setAttribute('type', 'text');
        input.setAttribute('class', 'row-edit-input');
        input.setAttribute('value', node.innerHTML);

        currentRowValues.push(node.innerHTML);

        input.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== 'Escape')
                return;

            const columnElements = currentRowElement.childNodes;

            let columns = [];
            for (let i = 0; i < columnElements.length; i++) {
                columns.push(
                    columnElements[i].childNodes[0].value
                    .replace(';', '')
                    .replace('=', '')
                );
            }

            if (e.key === 'Enter') {
                if (columns.some((column, i) => column !== currentRow[i])) {
                    contactServer(
                        'UPDATE', 
                        currentRow.join(';') + '=' + columns.join(';')
                    ).then(response => {
                        if (response === 'row-not-found') {
                            updateTable();
                        } else {
                            collectData();
                            leaveEditingMode(columns);
                        }
                    }).catch(e => {
                        connectionHalt();
                    });
                } else {
                    leaveEditingMode(columns);
                }
            } else if (e.key === 'Escape') {
                leaveEditingMode(currentRowValues);
            }
        }, false);

        clearChildren(node);

        node.appendChild(input);
    });
    hideManagePrompt();
}, false);

deleteButtonElement.addEventListener('click', () => {
    contactServer('DELETE', currentRow.join(';')).then(response => {
        if (response === 'row-not-found') {
            updateTable();
        } else {
            contractDataTBodyElement.removeChild(currentRowElement);
            data = data.filter(row => {
                return !Object.values(row).every((col, i) => {
                    return col === currentRow[i];
                });
            });
        }
    }).catch((e) => {
        connectionHalt();
    });
    hideManagePrompt();
}, false);

// Hide the manage prompt
function hideManagePrompt() {
    managePromptVisible = false;
    managePromptElement.style.display = 'none';
}

// Handler for row click event
function handleRowClick(e) {
    e.stopPropagation();
    if (!isEditing) {
        const columnNodes = e.target.parentNode.childNodes;

        currentRow = [];
        for (let i = 0; i < columnNodes.length; i++) {
            currentRow.push(columnNodes[i].innerHTML.replace(/;/g, '').replace('/=/g', ''));
        }
        currentRowElement = e.target.parentNode;

        let x = e.pageX, y = e.pageY;

        managePromptElement.style.left = (
            x + 225 >= window.innerWidth - 10 ?
            x - 225 : 
            x
        ) + 'px';
        managePromptElement.style.top = (
            y + 110 >= window.innerHeight - 10 ?
            y - 110 :
            y 
        ) + 'px';
        managePromptElement.style.display = 'block';

        managePromptVisible = true;
    }
}

// Update contract data table
function updateTable() {
    const orderBy = currentSearchByItem.innerText;

    // Clear contract data table body
    clearChildren(contractDataTBodyElement);

    // Create a row element for each row in data
    dataRenderBuffer
        .sort(
            (a, b) => (
                [
                    a[orderBy],
                    b[orderBy]
                ].sort()[0] === b[orderBy] | 0
            ) * 2 - 1
        )
        .forEach(row => {
            const rowElement = document.createElement('TR');
            rowElement.setAttribute('class', 'contract-table-row');

            // Show managing prompt on row click and update current row values
            rowElement.addEventListener('click', handleRowClick, false);

            // Set each column in row element to the corresponding data column
            for (let i in row) {
                const column = row[i];
                const columnElement = document.createElement('TD');
                const columnText = document.createTextNode(column);

                columnElement.appendChild(columnText);
                rowElement.appendChild(columnElement);
            }

            // Append row to contract data table element
            contractDataTBodyElement.appendChild(rowElement);
        });
}

// Asynchronously contact server and retrieve contract data
function collectData(firstTime = false) {
    contactServer('GET', 'contract_data').then(rawData => {
        data = [];
        let dataRows = rawData.trim().split('\n');
        console.log(dataRows);

        // Organize data into rows of objects
        dataRows.forEach(row => {
            addRow(row.split(';'));
        });

        if (firstTime) {
            dataRenderBuffer = data;
        } else {
            searchData();
        }
        updateTable();
    }).catch(e => {
        console.log(e);
        connectionHalt();
    });
}

// Hide list of search by options
function hideSearchByList() {
    searchByListExpanded = false;
    currentSearchByElement.classList.remove('search-by-active');
    searchByListElement.classList.remove('search-by-list-active');
}

// Show list of search by options
function expandSearchByList() {
    searchByListExpanded = true;
    currentSearchByElement.classList.add('search-by-active');
    searchByListElement.classList.add('search-by-list-active');
}

// Hide search list if the user clicked anywhere except the current search by button and if there's anything to hide
document.addEventListener('click', e => {
    if (searchByListExpanded) {
        hideSearchByList();
    }
    
    if (managePromptVisible) {
        hideManagePrompt();
    }
}, false);

// Add event for option selection to each search by list item
searchByListItems.forEach(item => {
    item.addEventListener('click', e => {
        if (currentSearchByItem) {
            currentSearchByItem.classList.remove('search-by-item-active');
        }
        currentSearchByItem = e.target;
        currentSearchByItem.classList.add('search-by-item-active');
        currentSearchByElement.innerText = currentSearchByItem.innerText;

    }, false);
});

// Toggle search by list expansion on press the current search by button
currentSearchByElement.addEventListener('click', e => {
    e.stopPropagation();
    if (!searchByListExpanded) {
        expandSearchByList();
    } else {
         hideSearchByList();
    }
}, false);

// Search through data and update the table
function searchData() {
    const searchTerm = searchTermElement.value;
    const searchBy = currentSearchByItem.innerText;

    if (searchTerm) {
        dataRenderBuffer = data.filter(row => {
            return row[searchBy].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        });
        updateTable();
    } else {
        dataRenderBuffer = data;
        updateTable();
    }
}

// Search data on press enter
searchTermElement.addEventListener('keydown', e => {
    if (e.key === 'Enter' && currentSearchByItem) {
        searchData();
    }
}, false);

// Keep focused status if there is content in the input
searchTermElement.addEventListener('focusout', () => {
    if (isFocused && !searchTermElement.value) {
        isFocused = false;
        searchTermElement.classList.remove('search-input-focused');
    } else if (!isFocused && searchTermElement.value) {
        isFocused = true;
        searchTermElement.classList.add('search-input-focused');
    }
}, false);

// General close on press ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (managePromptVisible)
            hideManagePrompt();
        if (searchByListExpanded)
            hideSearchByList();
        if (isAddingContract)
            hideBlockingPrompt();
    }
}, false);

// LOGIN

function requestLogin() {
    contactServer('LOGIN', '').then(response => {
        if (response !== 'i-am-a-teapot') {
            loginOverlay.classList.add('overlay-hidden');
            collectData(true);
        } else {
            alert('Invalid credentials.');
        }
    });
}

function attemptLogin() {
    const username = usernameInput.value;
    const password = passwordInput.getAttribute('data-password');

    const pattern = /^\w{1,16}$/;

    if (pattern.test(username) && pattern.test(password)) {
        const credentials = `${username}=${password}`;
        localStorage.setItem('credentials', credentials);
        requestLogin();
    }
}

passwordInput.addEventListener('keydown', e => {
    if (!(e.ctrlKey && e.key === 'r' || e.metaKey && e.key == 'r')) {
        e.preventDefault();
        const currentPassword = passwordInput.getAttribute('data-password') || '';
        const PI = passwordInput;

        if (e.key === 'Backspace') {
            PI.setAttribute(
                'data-password',
                currentPassword.slice(0, currentPassword.length - 1)
            );
            PI.value = PI.value.slice(0, PI.value.length - 1);
        } else if (e.key === 'Enter') {
            attemptLogin();
        } else if (/^\w$/.test(e.key) && currentPassword.length < 16) {
            passwordInput.setAttribute('data-password', currentPassword + e.key);
            passwordInput.value += '•';
        }
    }
}, false);

passwordInput.addEventListener('focusout', () => {
    if (passwordInput.value) {
        passwordInput.classList.add('login-input-active');
        passwordLabel.classList.add('login-label-active');
    } else {
        passwordInput.classList.remove('login-input-active');
        passwordLabel.classList.remove('login-label-active');
    }
}, false);

usernameInput.addEventListener('change', () => {
    if (usernameInput.value) {
        usernameInput.classList.add('login-input-active');
        usernameLabel.classList.add('login-label-active');
    } else {
        usernameInput.classList.remove('login-input-active');
        usernameLabel.classList.remove('login-label-active');
    }
}, false);

loginButton.addEventListener('click', () => {
    attemptLogin();
}, false);

if (localStorage.getItem('credentials')) {
    requestLogin();
}
