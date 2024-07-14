const clearButton = document.querySelector('#clear-button');
const addButton = document.querySelector('#add-button');
const copyAllButton = document.querySelector('#copy-all-button');
const syncButton = document.querySelector('#sync-button');
const outputSection  = document.querySelector('.output');
const inputSection  = document.querySelector('.input');
const headerList = document.querySelector('.header-list');
const headerButtons = document.querySelectorAll('.header-list__button');

let currentStorage = 'local';

init();

headerList.addEventListener('click', (evt) => {
    if ([...evt.target.classList].includes('header-list__button')) {
        const name = evt.target.name;

        currentStorage = name;

        headerButtons.forEach((button) => {
            if (button.name === name) {
                button.classList.remove('disabled');
                button.classList.add('active');

                return;
            }

            button.classList.add('disabled');
        })
    }
}, true);

clearButton.addEventListener('click', ()  =>  {
    chrome.runtime.sendMessage({ action: "clearStorage" }, () => {
        outputSection.innerHTML = '';
        inputSection.innerHTML = '';
    });
});

addButton.addEventListener('click', ()  =>   {
    inputSection.appendChild(createTable({'': ''}, 'input__table', true));
    const main = document.querySelector('.main');
    main.scrollTop = main.scrollHeight;
})

syncButton.addEventListener('click', ()  =>  {
    outputSection.innerHTML = '';
    inputSection.innerHTML = '';

    chrome.runtime.sendMessage({ action: "syncStorage" }, (value) => {
        const storage = JSON.parse(value)?.storage?.local ?? {};
        outputSection.appendChild(createTable(storage));
    });
})

copyAllButton.addEventListener('click', ()  =>  {
    chrome.runtime.sendMessage({ action: "copyAllStorage" }, (value) => {
        const storage = JSON.parse(value)?.storage?.local ?? '';
        navigator.clipboard.writeText(JSON.stringify(storage));
        Notification(`Storage ${currentStorage} copied!`, copyAllButton, 'success')
    });
})

function init() {
    chrome.runtime.sendMessage({ action: "getStorage" }, (value) => {
        outputSection.innerHTML = '';

        const storage = JSON.parse(value)?.storage?.local ?? {};
        outputSection.appendChild(createTable(storage));
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

    input.addEventListener('blur', updateStorage);

    cell.classList.add('output__cell', 'cell', classModificator);
    cell.title = content;
    cell.appendChild(input);

    return cell;
}

function createTableRow(nodes, key) {
    const row = document.createElement('tr');
    row.classList.add('output__row');

    if (key) {
        row.setAttribute('data-key', key);
    }

    nodes.forEach(node => {
        row.appendChild(node);
    });

    return row;
}

function createTable(data, className, isAddTable) {
    const table = document.createElement('table');
    table.classList.add(className ?? 'output__table');

    const keys = Object.keys(data);
    const values = Object.values(data);
    const tableBody = document.createElement('tbody');

    tableBody.innerHTML = '';
    keys.forEach((key, index) => {
        const cells = [
            createTableCell(key, 'key'),
            createTableCell(values[index], 'value')
        ];

        if (!isAddTable) {
            const handleTrashButton = (evt) => {
                evt.preventDefault();
                const row = evt.target.closest('tr');
                const keyRow = row.getAttribute('data-key');

                chrome.runtime.sendMessage({action: 'deleteItem', payload: {currentStorage, keyRow}}, () => {
                    row.remove();
                })
            };

            // cells.unshift(createSwitcher());
            cells.push(createCellButton('trash', handleTrashButton));
        }

        if (isAddTable) {
            const handleSaveButton = (evt) => {
                evt.preventDefault();

                const inputKeyCellTable = inputSection.querySelector('td > input');

                if (!inputKeyCellTable?.value) {
                    Notification('New field empty!', document.querySelector('#save-button'), 'error');

                    return;
                }

                updateStorage();
            };

            cells.push(createCellButton('save', handleSaveButton));
        }

        const row = createTableRow(cells, key);

        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);

    return table;
}

function createSwitcher() {
    const cell = document.createElement('td');
    cell.classList.add('cell__switcher');

    const label = document.createElement('label');
    label.classList.add('cell-label');
    label.title = 'change state';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'switcher';
    input.checked = true;

    input.addEventListener('change', (evt)  =>  {
        evt.target.cheked = !evt.target.checked;

        const row = evt.target.closest('tr');
        const keyRow = row.getAttribute('data-key');

        chrome.runtime.sendMessage({action: 'switchItem', payload: {currentStorage, keyRow}});
    });

    label.appendChild(input);
    cell.appendChild(label);

    return cell;
}

function createCellButton(iconName, handleClick) {
    const cell = document.createElement('td');
    const button = document.createElement('button');

    cell.classList.add('output__cell-button');
    cell.title = `${iconName === 'trash' ? 'delete' : 'save'} row`;
    button.classList.add('cell-button', iconName);
    button.id = `${iconName}-button`;
    button.addEventListener('click', handleClick);
    cell.appendChild(button);

    return cell;
}

function Notification(message, button, type) {
    const body = document.body;
    const div = document.createElement('div');
    div.classList.add('notification', 'hide', type);
    div.innerText = message;

    body.append(div);

    const notification = document.querySelector('.notification');

    setTimeout(() => {
        notification.classList.remove('hide');
    }, 100);
    setTimeout(() => {
        notification.classList.add('hide');
    }, 2000);

    setTimeout(() => {
        notification.remove();
    }, 2500);
}