let tabCount = 1;
let tabsData;
let isScientificMode = false;
let historyStack = [];
let redoStack = [];

// Initialize tabsData with default if localStorage is invalid
try {
    tabsData = JSON.parse(localStorage.getItem('calcTabs')) || {
        1: [{ expression: '', result: '' }]
    };
} catch {
    tabsData = { 1: [{ expression: '', result: '' }] };
    localStorage.setItem('calcTabs', JSON.stringify(tabsData));
}

// Button templates for numeric and scientific modes
const numericButtonTemplate = `
    <button onclick="addRow(this)" class="calc-btn">Next Line</button>
    <button onclick="toggleMode(this)" class="calc-btn">Scientific</button>
    <button onclick="clearInput(this)" class="calc-btn">C</button>
    <button onclick="backspace(this)" class="calc-btn">⌫</button>
    <button onclick="appendToInput(this)" class="calc-btn">/</button>
    <button onclick="appendToInput(this)" class="calc-btn">7</button>
    <button onclick="appendToInput(this)" class="calc-btn">8</button>
    <button onclick="appendToInput(this)" class="calc-btn">9</button>
    <button onclick="appendToInput(this)" class="calc-btn">*</button>
    <button onclick="appendToInput(this)" class="calc-btn">4</button>
    <button onclick="appendToInput(this)" class="calc-btn">5</button>
    <button onclick="appendToInput(this)" class="calc-btn">6</button>
    <button onclick="appendToInput(this)" class="calc-btn">-</button>
    <button onclick="appendToInput(this)" class="calc-btn">1</button>
    <button onclick="appendToInput(this)" class="calc-btn">2</button>
    <button onclick="appendToInput(this)" class="calc-btn">3</button>
    <button onclick="appendToInput(this)" class="calc-btn">+</button>
    <button onclick="appendToInput(this)" class="calc-btn">0</button>
    <button onclick="appendToInput(this)" class="calc-btn">.</button>
    <button onclick="appendToInput(this)" class="calc-btn">00</button>
`;

const scientificButtonTemplate = `
    <button onclick="addRow(this)" class="calc-btn">Next Line</button>
    <button onclick="toggleMode(this)" class="calc-btn">Numeric</button>
    <button onclick="clearInput(this)" class="calc-btn">C</button>
    <button onclick="backspace(this)" class="calc-btn">⌫</button>
    <button onclick="appendToInput(this)" class="calc-btn">/</button>
    <button onclick="appendToInput(this)" class="calc-btn">sin(</button>
    <button onclick="appendToInput(this)" class="calc-btn">cos(</button>
    <button onclick="appendToInput(this)" class="calc-btn">tan(</button>
    <button onclick="appendToInput(this)" class="calc-btn">*</button>
    <button onclick="appendToInput(this)" class="calc-btn">log(</button>
    <button onclick="appendToInput(this)" class="calc-btn">ln(</button>
    <button onclick="appendToInput(this)" class="calc-btn">sqrt(</button>
    <button onclick="appendToInput(this)" class="calc-btn">-</button>
    <button onclick="appendToInput(this)" class="calc-btn">π</button>
    <button onclick="appendToInput(this)" class="calc-btn">e</button>
    <button onclick="appendToInput(this)" class="calc-btn"><span class="fraction"><sup>a</sup>/<sub>b</sub></span></button>
    <button onclick="appendToInput(this)" class="calc-btn">+</button>
    <button onclick="appendToInput(this)" class="calc-btn">(</button>
    <button onclick="appendToInput(this)" class="calc-btn">)</button>
    <button onclick="appendToInput(this)" class="calc-btn">^</button>
    <button onclick="appendToInput(this)" class="calc-btn">!</button>
`;

function saveState() {
    historyStack.push(JSON.stringify(tabsData));
    redoStack = [];
    if (historyStack.length > 50) historyStack.shift();
}

function undo() {
    if (historyStack.length > 0) {
        redoStack.push(JSON.stringify(tabsData));
        tabsData = JSON.parse(historyStack.pop());
        localStorage.setItem('calcTabs', JSON.stringify(tabsData));
        loadTabData();
        const activeInput = document.querySelector('.tab-pane.active .calc-input');
        if (activeInput) activeInput.focus();
    }
}

function redo() {
    if (redoStack.length > 0) {
        historyStack.push(JSON.stringify(tabsData));
        tabsData = JSON.parse(redoStack.pop());
        localStorage.setItem('calcTabs', JSON.stringify(tabsData));
        loadTabData();
        const activeInput = document.querySelector('.tab-pane.active .calc-input');
        if (activeInput) activeInput.focus();
    }
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    document.querySelector('.header').classList.toggle('night-mode');
}

function toggleOptions() {
    document.querySelector('.options').classList.toggle('active');
}

function calculate(input) {
    let expression = input.value;
    expression = expression.replace(/<span class="fraction"><sup>a<\/sup>\/<sub>b<\/sub><\/span>/g, '/');
    expression = expression.replace(/÷/g, '/');
    try {
        const result = eval(expression); // Note: eval for simplicity; use math.js in production
        input.parentElement.querySelector('.calc-result').textContent = isNaN(result) ? '' : result;
        saveTabData();
    } catch {
        input.parentElement.querySelector('.calc-result').textContent = '';
    }
}

function appendToInput(button) {
    const input = document.activeElement.classList.contains('calc-input') ? document.activeElement : button.closest('.tab-pane').querySelector('.calc-input');
    saveState();
    const content = button.innerHTML.includes('fraction') ? '<span class="fraction"><sup>a</sup>/<sub>b</sub></span>' : button.textContent;
    input.value += content;
    input.focus();
    calculate(input);
}

function backspace(button) {
    const input = document.activeElement.classList.contains('calc-input') ? document.activeElement : button.closest('.tab-pane').querySelector('.calc-input');
    saveState();
    input.value = input.value.slice(0, -1);
    input.focus();
    calculate(input);
}

function clearInput(button) {
    const input = document.activeElement.classList.contains('calc-input') ? document.activeElement : button.closest('.tab-pane').querySelector('.calc-input');
    saveState();
    input.value = '';
    input.parentElement.querySelector('.calc-result').textContent = '';
    input.focus();
    saveTabData();
}

function addRow(button) {
    saveState();
    const pane = button.closest('.tab-pane');
    const display = pane.querySelector('.calc-display');
    const newRow = document.createElement('div');
    newRow.className = 'calc-row';
    newRow.innerHTML = `
        <input type="text" class="calc-input" placeholder="Enter calculation" readonly>
        <span class="calc-result"></span>
    `;
    display.appendChild(newRow);
    const newInput = newRow.querySelector('.calc-input');
    newInput.focus();
    addInputListeners(newInput);
    saveTabData();
}

function toggleMode(button) {
    isScientificMode = !isScientificMode;
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const buttonsContainer = pane.querySelector('.calc-buttons');
        buttonsContainer.innerHTML = isScientificMode ? scientificButtonTemplate : numericButtonTemplate;
    });
}

function addTab() {
    saveState();
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
                <input type="text" class="calc-input" placeholder="Enter calculation" readonly>
                <span class="calc-result"></span>
            </div>
        </div>
        <div class="calc-buttons">${isScientificMode ? scientificButtonTemplate : numericButtonTemplate}</div>
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
    tabList.innerHTML = '';
    tabCount = 0;

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
                    <input type="text" class="calc-input" value="${row.expression}" placeholder="Enter calculation" readonly>
                    <span class="calc-result">${row.result}</span>
                </div>
            `;
        });
        displayHTML += '</div>';
        newPane.innerHTML = `
            ${displayHTML}
            <div class="calc-buttons">${isScientificMode ? scientificButtonTemplate : numericButtonTemplate}</div>
        `;
        tabContent.appendChild(newPane);
        newPane.querySelectorAll('.calc-input').forEach(addInputListeners);
    });
}

function addInputListeners(input) {
    input.onclick = () => input.focus();
    input.oninput = () => calculate(input);
    input.onkeydown = e => {
        const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', '(', ')', 'Enter', 'Backspace'];
        if (validKeys.includes(e.key)) {
            if (e.key === 'Enter') {
                addRow(input.closest('.tab-pane').querySelector('.calc-btn[onclick*="addRow"]'));
            } else if (e.key === 'Backspace') {
                saveState();
                input.value = input.value.slice(0, -1);
                calculate(input);
            } else {
                saveState();
                input.value += e.key;
                calculate(input);
            }
        }
    };
}

function clearAllRows() {
    saveState();
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