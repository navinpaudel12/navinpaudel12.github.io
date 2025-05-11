let tabCount = 1;
let tabsData;

// Initialize tabsData with default if localStorage is invalid
try {
    tabsData = JSON.parse(localStorage.getItem('calcTabs')) || {
        1: [{ expression: '', result: '' }]
    };
} catch {
    tabsData = { 1: [{ expression: '', result: '' }] };
    localStorage.setItem('calcTabs', JSON.stringify(tabsData));
}

// Static button template to ensure buttons always render
const buttonTemplate = `
    <button onclick="appendToInput(this)" class="calc-btn">1</button>
    <button onclick="appendToInput(this)" class="calc-btn">2</button>
    <button onclick="appendToInput(this)" class="calc-btn">3</button>
    <button onclick="appendToInput(this)" class="calc-btn">+</button>
    <button onclick="appendToInput(this)" class="calc-btn">4</button>
    <button onclick="appendToInput(this)" class="calc-btn">5</button>
    <button onclick="appendToInput(this)" class="calc-btn">6</button>
    <button onclick="appendToInput(this)" class="calc-btn">-</button>
    <button onclick="appendToInput(this)" class="calc-btn">7</button>
    <button onclick="appendToInput(this)" class="calc-btn">8</button>
    <button onclick="appendToInput(this)" class="calc-btn">9</button>
    <button onclick="appendToInput(this)" class="calc-btn">*</button>
    <button onclick="appendToInput(this)" class="calc-btn">0</button>
    <button onclick="appendToInput(this)" class="calc-btn">.</button>
    <button onclick="appendToInput(this)" class="calc-btn">/</button>
    <button onclick="appendToInput(this)" class="calc-btn">(</button>
    <button onclick="appendToInput(this)" class="calc-btn">)</button>
    <button onclick="appendToInput(this)" class="calc-btn">00</button>
    <button onclick="appendToInput(this)" class="calc-btn">000</button>
    <button onclick="backspace(this)" class="calc-btn">⌫</button>
    <button onclick="clearInput(this)" class="calc-btn">C</button>
`;

function calculate(input) {
    const expression = input.value;
    try {
        const result = eval(expression); // Note: eval is used for simplicity; consider math.js for production
        input.parentElement.querySelector('.calc-result').textContent = isNaN(result) ? '' : result;
        saveTabData();
    } catch {
        input.parentElement.querySelector('.calc-result').textContent = '';
    }
}

function appendToInput(button) {
    const input = button.closest('.tab-pane').querySelector('.calc-input:focus') || button.closest('.tab-pane').querySelector('.calc-input');
    input.value += button.textContent;
    input.focus();
    calculate(input);
}

function backspace(button) {
    const input = button.closest('.tab-pane').querySelector('.calc-input:focus') || button.closest('.tab-pane').querySelector('.calc-input');
    input.value = input.value.slice(0, -1);
    input.focus();
    calculate(input);
}

function clearInput(button) {
    const input = button.closest('.tab-pane').querySelector('.calc-input:focus') || button.closest('.tab-pane').querySelector('.calc-input');
    input.value = '';
    input.parentElement.querySelector('.calc-result').textContent = '';
    input.focus();
    saveTabData();
}

function addRow(button) {
    const pane = button.closest('.tab-pane');
    const display = pane.querySelector('.calc-display');
    const newRow = document.createElement('div');
    newRow.className = 'calc-row';
    newRow.innerHTML = `
        <input type="text" class="calc-input" placeholder="Enter calculation">
        <span class="calc-result"></span>
    `;
    display.appendChild(newRow);
    const newInput = newRow.querySelector('.calc-input');
    newInput.focus();
    addInputListeners(newInput);
    saveTabData();
}

function addTab() {
    tabCount++;
    const tabList = document.getElementById('tabList');
    const tabContent = document.getElementById('tabContent');

    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.dataset.tab = tabCount;
    newTab.textContent = `Tab ${tabCount}`;
    newTab.onclick = () => switchTab(tabCount);
    tabList.appendChild(newTab);

    const newPane = document.createElement('div');
    newPane.className = 'tab-pane';
    newPane.dataset.tab = tabCount;
    newPane.innerHTML = `
        <div class="calc-display">
            <div class="calc-row">
                <input type="text" class="calc-input" placeholder="Enter calculation">
                <span class="calc-result"></span>
            </div>
        </div>
        <button class="add-row" onclick="addRow(this)">Next Line</button>
        <div class="calc-buttons">${buttonTemplate}</div>
    `;
    tabContent.appendChild(newPane);
    tabsData[tabCount] = [{ expression: '', result: '' }];
    switchTab(tabCount);
    const newInput = newPane.querySelector('.calc-input');
    newInput.focus();
    addInputListeners(newInput);
    saveTabData();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const pane = document.querySelector(`.tab-pane[data-tab="${tabId}"]`);
    if (tab) tab.classList.add('active');
    if (pane) pane.classList.add('active');
    const inputs = pane ? pane.querySelector('.calc-input') : null;
    if (inputs) inputs.focus();
}

function saveTabData() {
    const newTabsData = {};
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const tabId = pane.dataset.tab;
        newTabsData[tabId] = [];
        pane.querySelectorAll('.calc-row').forEach(row => {
            const input = row.querySelector('.calc-input');
            const result = row.querySelector('.calc-result').textContent;
            newTabsData[tabId].push({ expression: input.value, result });
        });
    });
    tabsData = newTabsData;
    localStorage.setItem('calcTabs', JSON.stringify(tabsData));
}

function loadTabData() {
    const tabContent = document.getElementById('tabContent');
    const tabList = document.getElementById('tabList');
    tabContent.innerHTML = '';
    tabList.innerHTML = ''; // Clear tab list to avoid duplicates
    tabCount = 0;

    // Ensure at least one tab exists
    if (Object.keys(tabsData).length === 0) {
        tabsData = { 1: [{ expression: '', result: '' }] };
        localStorage.setItem('calcTabs', JSON.stringify(tabsData));
    }

    Object.keys(tabsData).forEach(tabId => {
        tabCount = Math.max(tabCount, parseInt(tabId));
        const newTab = document.createElement('div');
        newTab.className = `tab ${tabId === '1' ? 'active' : ''}`;
        newTab.dataset.tab = tabId;
        newTab.textContent = `Tab ${tabId}`;
        newTab.onclick = () => switchTab(tabId);
        tabList.appendChild(newTab);

        const newPane = document.createElement('div');
        newPane.className = `tab-pane ${tabId === '1' ? 'active' : ''}`;
        newPane.dataset.tab = tabId;
        let displayHTML = '<div class="calc-display">';
        tabsData[tabId].forEach(row => {
            displayHTML += `
                <div class="calc-row">
                    <input type="text" class="calc-input" value="${row.expression}" placeholder="Enter calculation">
                    <span class="calc-result">${row.result}</span>
                </div>
            `;
        });
        displayHTML += '</div>';
        newPane.innerHTML = `
            ${displayHTML}
            <button class="add-row" onclick="addRow(this)">Next Line</button>
            <div class="calc-buttons">${buttonTemplate}</div>
        `;
        tabContent.appendChild(newPane);
        newPane.querySelectorAll('.calc-input').forEach(addInputListeners);
    });
}

function addInputListeners(input) {
    input.oninput = () => calculate(input);
    input.onkeydown = e => {
        if (e.key === 'Enter') {
            addRow(input.closest('.tab-pane').querySelector('.add-row'));
            e.preventDefault();
        }
    };
    input.onkeypress = e => {
        const validChars = /[0-9+\-*/.()]/;
        if (!validChars.test(e.key)) {
            e.preventDefault();
        }
    };
}

function deleteSelectedRows() {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const rows = pane.querySelectorAll('.calc-row');
        if (rows.length > 1) {
            rows.forEach((row, index) => {
                if (row.querySelector('.calc-input').value === '' && index !== rows.length - 1) {
                    row.remove();
                }
            });
        }
    });
    saveTabData();
    const activeInput = document.querySelector('.tab-pane.active .calc-input');
    if (activeInput) activeInput.focus();
}

function clearAllRows() {
    tabsData = { 1: [{ expression: '', result: '' }] };
    localStorage.setItem('calcTabs', JSON.stringify(tabsData));
    loadTabData();
    const activeInput = document.querySelector('.tab-pane.active .calc-input');
    if (activeInput) activeInput.focus();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTabData();
    const firstTab = document.querySelector('.tab');
    const firstPane = document.querySelector('.tab-pane');
    if (firstTab) firstTab.classList.add('active');
    if (firstPane) firstPane.classList.add('active');
    const activeInput = document.querySelector('.tab-pane.active .calc-input');
    if (activeInput) activeInput.focus();
});