function insert(char) {
    document.getElementById('display').value += char;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function backspace() {
    var value = document.getElementById('display').value;
    document.getElementById('display').value = value.substr(0, value.length - 1);
}

function calculate() {
    var result = eval(document.getElementById('display').value);
    document.getElementById('display').value = result;
}