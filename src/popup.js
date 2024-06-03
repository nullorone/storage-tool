const editButton = document.querySelector('#edit-button');
const clearButton = document.querySelector('#clear-button');
const saveButton = document.querySelector('#save-button');
const addButton = document.querySelector('#add-button');
const outputSection  = document.querySelector('.output');
const inputSection  = document.querySelector('.input');

init();

editButton.addEventListener('click', ()  =>  {
    outputSection.querySelectorAll('.output__input').forEach((input)  =>  {
        input.disabled = false;
    });
});

clearButton.addEventListener('click', ()  =>  {
    chrome.runtime.sendMessage({ action: "clearStorage" }, () => {
        outputSection.innerHTML = '';
    });
});

saveButton.addEventListener('click', ()  =>  {
    updateStorage(true);
});

addButton.addEventListener('click', ()  =>   {
    inputSection.appendChild(createTable({'': ''}, 'input__table'));
})

function init() {
    chrome.runtime.sendMessage({ action: "getStorage" }, (value) => {
        outputSection.innerHTML = '';

        const storage = JSON.parse(value).storage.local;
        outputSection.appendChild(createTable(storage));
        outputSection.querySelectorAll('.output__input').forEach((input)  =>  {
            input.disabled = true;
        });
    });
}

function updateStorage() {
    const addedData = {};
    const outputRows = outputSection.querySelectorAll('.output__row');
    const inputRows = inputSection.querySelectorAll('.output__row');

    [...outputRows, ...inputRows].forEach((row) => {
        const keyCell = row.querySelector('.output__cell--key input');
        const valueCell = row.querySelector('.output__cell--value input');
        addedData[keyCell.value] = valueCell.value;
    });

    chrome.runtime.sendMessage({ action: "updateStorage",  payload: addedData  }, (value) => {
        outputSection.innerHTML = '';
        inputSection.innerHTML = '';

        const storage = JSON.parse(value).storage.local;
        outputSection.appendChild(createTable(storage));

        outputSection.querySelectorAll('.output__input').forEach((input)  =>  {
            input.disabled = true;
        });
    })
}

function createTableCell(content, cellModificator) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    const classModificator = cellModificator ? `output__cell--${cellModificator}` : ' ';
    input.classList.add('output__input');
    input.type = 'text';
    input.disabled = false;
    input.value = content;

    cell.classList.add('output__cell', 'cell', classModificator);
    cell.title = content;
    cell.appendChild(input);

    return cell;
}

function createTableRow(nodes) {
    const row = document.createElement('tr');
    row.classList.add('output__row');

    nodes.forEach(node => {
        row.appendChild(node);
    });

    return row;
}

function createTable(data, className) {
    const table = document.createElement('table');
    table.classList.add(className ?? 'output__table');

    const keys = Object.keys(data);
    const values = Object.values(data);
    const tableBody = document.createElement('tbody');

    tableBody.innerHTML = '';
    keys.forEach((key, index) => {
        const row = createTableRow([
            createTableCell(key, 'key'),
            createTableCell(values[index], 'value')
        ]);
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);

    return table;
}

function createSwitcher() {
    const switcher = createTableCell('', 'switcher');

    const label = document.createElement('label');
    label.classList.add('cell__switcher');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'switcher';
    input.checked = false;

    input.addEventListener('change', (evt)  =>  {
        evt.target.cheked = !evt.target.checked;
    });
    label.appendChild(input);
    switcher.appendChild(label);

    return switcher;
}