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

// Determine whether the user is editing a row
let isEditing;

// Keep track of current search by term option
let currentSearchBy = '';

// Send and receive HTTP requests to and from the server
function contactServer(requestType, request) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                resolve(xhttp.responseText);
            }
        };
        xhttp.open(requestType, request);

        try {
            xhttp.send();
        } catch(e) {
            reject();
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

// Show add prompt on add button press
addButtonElement.addEventListener('click', e => {
    e.stopPropagation();

    isAddingContract = true;

    const table = document.createElement('TABLE');
    table.setAttribute('id', 'add-table');

    const headerRow = document.createElement('TR');
    const headers = ['Unidade', 'N. Contrato', 'CPF/CNPJ', 'Nome'];

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

                    if (!column) return;
                    dataRow.push(column);
                }

                contactServer('ADD', dataRow.join(';')).then(() => {
                    const rowElement = document.createElement('TR');
                    rowElement.setAttribute('class', 'contract-data-row');

                    dataRow.forEach(column => {
                        const columnElement = document.createElement('TD');
                        const columnText = document.createTextNode(column);

                        columnElement.appendChild(columnText);
                        rowElement.appendChild(columnElement);
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

// Event listeners for the manage prompt buttons
editButtonElement.addEventListener('click', e => {
    // Change columns to inputs and send an HTTP request detailing update data if anything was changed
    isEditing = true;

    const columnNodes = currentRowElement.childNodes;

    columnNodes.forEach(node => {
        const input = document.createElement('INPUT');

        input.setAttribute('type', 'text');
        input.setAttribute('class', 'row-edit-input');
        input.setAttribute('value', node.innerText);

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const columnElements = currentRowElement.childNodes;
                
                let columns = [];
                for (let i = 0; i < columnElements.length; i++) {
                    columns.push(
                        columnElements[i].childNodes[0].value
                        .replace(';', '')
                        .replace('=', '')
                    );
                }

                if (columns.some((column, i) => column !== currentRow[i])) {
                    contactServer(
                        'UPDATE', 
                        currentRow.join(';') + '=' + columns.join(';')
                    ).then(() => {
                        isEditing = false;
                        currentRowElement.childNodes.forEach((column, i) => {
                            const text = document.createTextNode(columns[i]);

                            clearChildren(column);
                            column.appendChild(text);
                        });
                    }).catch(() => {
                        connectionHalt();
                    });
                }
            }
        }, false);

        clearChildren(node);

        node.appendChild(input);
    });
    hideManagePrompt();
}, false);

deleteButtonElement.addEventListener('click', () => {
    contactServer('DELETE', currentRow.join(';')).then(() => {
        contractDataTBodyElement.removeChild(currentRowElement);
    }).catch(() => {
        connectionHalt();
    });
    hideManagePrompt();
}, false);

// Hide the manage prompt
function hideManagePrompt() {
    managePromptVisible = false;
    managePromptElement.style.display = 'none';
}

// Update contract data table
function updateTable(orderBy = 'N. Contrato') {
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
            rowElement.addEventListener('click', e => {
                e.stopPropagation();
                if (!isEditing) {
                    const columnNodes = e.target.parentNode.childNodes;

                    currentRow = [];
                    for (let i = 0; i < columnNodes.length; i++) {
                        currentRow.push(columnNodes[i].innerText);
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
            }, false);

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
contactServer('GET', '/contract_data.txt').then(rawData => {
    let dataRows = rawData.trim().split('\n');

    // Organize data into rows of objects
    dataRows.forEach(row => {
        [unidade, contrato, documento, nome] = row.split(';');
        data.push({
            'Unidade': unidade,
            'N. Contrato': contrato,
            'CPF/CNPJ': documento,
            'Nome': nome
        });
    });

    dataRenderBuffer = data;
    updateTable();
}).catch(() => {
    connectionHalt();
});


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
        if (currentSearchBy) {
            currentSearchBy.classList.remove('search-by-item-active');
        }
        currentSearchBy = e.target;
        currentSearchBy.classList.add('search-by-item-active');
        currentSearchByElement.innerText = currentSearchBy.innerText;

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
    searchTerm = searchTermElement.value;
    searchBy = currentSearchBy.innerText;

    if (searchTerm) {
        dataRenderBuffer = data.filter(row => {
            return row[searchBy].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        });
        updateTable(searchBy);
    } else {
        dataRenderBuffer = data;
        updateTable(searchBy);
    }
}

// Search data on press enter
searchTermElement.addEventListener('keydown', e => {
    if (e.key === 'Enter' && currentSearchBy) {
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
