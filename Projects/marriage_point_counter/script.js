// Game data storage
let games = JSON.parse(localStorage.getItem('marriageGames')) || [];

// DOM elements
const homePage = document.getElementById('home-page');
const setupPage = document.getElementById('setup-page');
const gamePage = document.getElementById('game-page');
const gameList = document.getElementById('game-list');
const newGameBtn = document.getElementById('new-game-btn');
const gameSettingsForm = document.getElementById('game-settings-form');
const addPlayerBtn = document.getElementById('add-player-btn');
const removePlayerBtn = document.getElementById('remove-player-btn');
const playerInputs = document.getElementById('player-inputs');
const roundForm = document.getElementById('round-form');
const winnerSelect = document.getElementById('winner-select');
const playerRoundInputs = document.getElementById('player-round-inputs');
const roundTable = document.getElementById('round-table');
const playerHeaders = document.getElementById('player-headers');
const roundRows = document.getElementById('round-rows');
const gameTitle = document.getElementById('game-title');

let currentGameIndex = null;
const clearDataBtn = document.getElementById('clear-data-btn');
clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
        localStorage.removeItem('marriageGames');
        games = [];
        loadGameList();
        alert('All game data has been cleared.');
    }
});
// Show page
function showPage(page) {
    [homePage, setupPage, gamePage].forEach(p => p.classList.add('hidden'));
    page.classList.remove('hidden');
}

// Format date
function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleString('en-US', options);
}

// Load game list
function loadGameList() {
    gameList.innerHTML = '';
    games.forEach((game, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Game ${index + 1} (${game.players.join(', ')}) - <small>${formatDate(game.lastUpdated)}</small></span>
            <button class="btn small" onclick="loadGame(${index})">Continue</button>
        `;
        gameList.appendChild(li);
    });
}

// Initialize home page
loadGameList();
showPage(homePage);

// New game
newGameBtn.addEventListener('click', () => {
    showPage(setupPage);
    playerInputs.innerHTML = `
        <input type="text" class="player-name" placeholder="Player 1" required>
        <input type="text" class="player-name" placeholder="Player 2" required>
    `;
});

// Add player
addPlayerBtn.addEventListener('click', () => {
    const inputs = playerInputs.querySelectorAll('.player-name');
    if (inputs.length < 8) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name';
        input.placeholder = `Player ${inputs.length + 1}`;
        input.required = true;
        playerInputs.appendChild(input);
    }
});

// Remove player
removePlayerBtn.addEventListener('click', () => {
    const inputs = playerInputs.querySelectorAll('.player-name');
    if (inputs.length > 2) {
        playerInputs.removeChild(inputs[inputs.length - 1]);
    }
});

// Save game settings
gameSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const players = Array.from(playerInputs.querySelectorAll('.player-name'))
        .map(input => input.value.trim())
        .filter(name => name);
    if (players.length < 2 || players.length > 8) {
        alert('Please enter 2 to 8 players.');
        return;
    }
    const game = {
        settings: {
            pointRate: parseInt(document.getElementById('point-rate').value),
            seenPoint: parseInt(document.getElementById('seen-point').value),
            unseenPoint: parseInt(document.getElementById('unseen-point').value),
            dubleeBonus: parseInt(document.getElementById('dublee-bonus').value)
        },
        players,
        rounds: [],
        lastUpdated: new Date().toISOString(),
        totals: players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {})
    };
    games.push(game);
    currentGameIndex = games.length - 1;
    saveGames();
    loadGame(currentGameIndex);
});

// Load game
function loadGame(index) {
    currentGameIndex = index;
    const game = games[index];
    gameTitle.textContent = `Game ${index + 1} (${game.players.join(', ')})`;

    // Setup winner select
    winnerSelect.innerHTML = '<option value="" disabled selected>Select Winner</option>';
    game.players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        winnerSelect.appendChild(option);
    });

    // Setup round inputs
    playerRoundInputs.innerHTML = '';
    game.players.forEach(player => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h4>${player}</h4>
            <label>Maal:</label>
            <input type="number" min="0" data-player="${player}" class="maal-input" value="0">
            <label>Status:</label>
            <select data-player="${player}" class="status-select">
                <option value="unseen" selected>Unseen</option>
                <option value="seen">Seen</option>
                ${game.players.length >= 4 ? '<option value="dublee">Dublee</option>' : ''}
            </select>
        `;
        playerRoundInputs.appendChild(div);
    });

    // Setup table headers
    playerHeaders.innerHTML = '<th>Round</th>';
    game.players.forEach(player => {
        playerHeaders.innerHTML += `<th>${player}</th>`;
    });
    playerHeaders.innerHTML += '<th>Actions</th>';

    // Load rounds
    renderRounds();
    showPage(gamePage);
}

// Auto-update status based on maal
playerRoundInputs.addEventListener('input', (e) => {
    if (e.target.classList.contains('maal-input')) {
        const player = e.target.dataset.player;
        const statusSelect = playerRoundInputs.querySelector(`.status-select[data-player="${player}"]`);
        const maal = parseInt(e.target.value) || 0;
        if (maal > 0) {
            statusSelect.value = 'seen';
        } else if (statusSelect.value === 'seen') {
            statusSelect.value = 'unseen';
        }
    }
});

// Force unseen to reset maal
playerRoundInputs.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
        const player = e.target.dataset.player;
        const maalInput = playerRoundInputs.querySelector(`.maal-input[data-player="${player}"]`);
        if (e.target.value === 'unseen') {
            maalInput.value = 0;
        } else if (parseInt(maalInput.value) === 0 && e.target.value === 'seen') {
            maalInput.value = 1;
        }
    }
});

// Add round
roundForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const game = games[currentGameIndex];
    const winner = winnerSelect.value;
    if (!winner) {
        alert('Please select a winner.');
        return;
    }
    const round = {
        winner,
        maal: {},
        status: {},
        points: {},
        amounts: {}
    };

    let totalMaal = 0;
    const inputs = playerRoundInputs.querySelectorAll('.maal-input');
    const statuses = playerRoundInputs.querySelectorAll('.status-select');

    inputs.forEach(input => {
        const player = input.dataset.player;
        round.maal[player] = parseInt(input.value) || 0;
        totalMaal += round.maal[player];
    });

    statuses.forEach(select => {
        const player = select.dataset.player;
        round.status[player] = select.value;
        // Validate winner status
        if (player === winner && select.value === 'unseen') {
            alert('Winner cannot be unseen.');
            return;
        }
    });

    if (Object.values(round.status).includes('dublee') && game.players.length < 4) {
        alert('Dublee is only available with 4 or more players.');
        return;
    }

    // Calculate points
    const { seenPoint, unseenPoint, dubleeBonus, pointRate } = game.settings;
    const numPlayers = game.players.length;
    const isDubleeWin = round.status[winner] === 'dublee';

    game.players.forEach(player => {
        if (player === winner) {
            let winnerPoints = 0;
            game.players.forEach(other => {
                if (other !== winner) {
                    let otherPoints = 0;
                    if (round.status[other] === 'seen') {
                        otherPoints = (round.maal[other] * numPlayers) - (totalMaal + seenPoint + (isDubleeWin ? dubleeBonus : 0));
                    } else if (round.status[other] === 'unseen') {
                        otherPoints = -(totalMaal + unseenPoint + (isDubleeWin ? dubleeBonus : 0));
                    } else if (round.status[other] === 'dublee') {
                        otherPoints = (round.maal[other] * numPlayers) - (totalMaal + (isDubleeWin ? dubleeBonus : 0));
                    }
                    round.points[other] = otherPoints;
                    winnerPoints -= otherPoints; // Winner's receivable is sum of others' payable
                }
            });
            round.points[winner] = winnerPoints;
        } else if (round.status[player] === 'seen') {
            round.points[player] = (round.maal[player] * numPlayers) - (totalMaal + seenPoint + (isDubleeWin ? dubleeBonus : 0));
        } else if (round.status[player] === 'unseen') {
            round.points[player] = -(totalMaal + unseenPoint + (isDubleeWin ? dubleeBonus : 0));
        } else if (round.status[player] === 'dublee') {
            round.points[player] = (round.maal[player] * numPlayers) - (totalMaal + (isDubleeWin ? dubleeBonus : 0));
        }
        round.amounts[player] = round.points[player] * pointRate;
        game.totals[player] += round.amounts[player];
    });

    game.rounds.push(round);
    game.lastUpdated = new Date().toISOString();
    saveGames();
    renderRounds();
    roundForm.reset();
    winnerSelect.value = '';
    inputs.forEach(input => input.value = '0');
    statuses.forEach(select => select.value = 'unseen');
});

// Render rounds
function renderRounds() {
    const game = games[currentGameIndex];
    roundRows.innerHTML = '';

    game.rounds.forEach((round, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>Round ${index + 1}</td>`;
        game.players.forEach(player => {
            const amount = round.amounts[player];
            const className = amount < 0 ? 'payable' : 'receivable';
            const statusIcon = round.status[player] === 'seen' ? '👀' : round.status[player] === 'unseen' ? '🙈' : '🎴';
            const winnerIcon = player === round.winner ? '🏆' : '';
            row.innerHTML += `
                <td>
                    <span class="${className}">${amount}</span>
                    <small> (Points: ${round.points[player]}, Maal: ${round.maal[player]})</small>
                    <span class="status-icon">${statusIcon}</span>
                    <span class="winner-icon">${winnerIcon}</span>
                </td>
            `;
        });
        row.innerHTML += `<td><button class="edit-btn" onclick="editRound(${index})">Edit</button></td>`;
        roundRows.appendChild(row);
    });

    // Total row
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = '<td><strong>Total</strong></td>';
    game.players.forEach(player => {
        const total = game.totals[player];
        const className = total < 0 ? 'payable' : 'receivable';
        totalRow.innerHTML += `<td><strong class="${className}">${total}</strong></td>`;
    });
    totalRow.innerHTML += '<td></td>';
    roundRows.appendChild(totalRow);
}

// Edit round
function editRound(roundIndex) {
    const game = games[currentGameIndex];
    const round = game.rounds[roundIndex];

    // Deduct current round amounts from totals
    game.players.forEach(player => {
        game.totals[player] -= round.amounts[player];
    });

    // Populate form
    winnerSelect.value = round.winner;
    playerRoundInputs.querySelectorAll('.maal-input').forEach(input => {
        input.value = round.maal[input.dataset.player];
    });
    playerRoundInputs.querySelectorAll('.status-select').forEach(select => {
        select.value = round.status[select.dataset.player];
    });

    // Remove round
    game.rounds.splice(roundIndex, 1);
    game.lastUpdated = new Date().toISOString();
    saveGames();
    renderRounds();
}

// Save games to localStorage
function saveGames() {
    localStorage.setItem('marriageGames', JSON.stringify(games));
    loadGameList();
}

// Home button navigation
document.querySelectorAll('.home-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showPage(homePage);
    });
});