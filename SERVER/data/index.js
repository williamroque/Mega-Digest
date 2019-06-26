const searchTermElement = document.querySelector('#search-term');

const currentSearchByElement = document.querySelector('#current-search-by');
const searchByListElement = document.querySelector('#search-by-list');
const searchByListItems = document.querySelector('.search-by-list-item');

const contractTableElement = document.querySelector('#contract-data-table');

function contactServer() {
    return new Promise((resolve, _) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                resolve(xhttp.responseText);
            }
        };
        xhttp.open('GET', '/contract_data.txt');
        xhttp.send();
    });
}

async function requestData() {
    const data = await contactServer();

    console.log(data);
}

requestData();
