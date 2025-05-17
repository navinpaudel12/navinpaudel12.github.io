// Game data storage
let games = JSON.parse(localStorage.getItem('marriageGames')) || [];

// DOM elements
const homePage = document.getElementById('home-page');
const setupPage = document.getElementById('setup-page');
const gamePage = document.getElementById('game-page');
const renamePage = document.getElementById('rename-page');
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
const calculateBtn = document.getElementById('calculate-btn');
const renamePlayersBtn = document.getElementById('rename-players-btn');
const renamePlayersForm = document.getElementById('rename-players-form');
const renamePlayerInputs = document.getElementById('rename-player-inputs');
const selectGamesBtn = document.getElementById('select-games-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const themeToggle = document.getElementById('theme-toggle');
const optionsBtn = document.getElementById('options-btn');
const optionsDropdown = document.getElementById('options-dropdown');

let currentGameIndex = null;
let isSelectionMode = false;

// Theme toggle
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Load theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

// Options dropdown toggle
optionsBtn.addEventListener('click', () => {
    optionsDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!optionsBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
        optionsDropdown.classList.add('hidden');
    }
});

// Clear data
clearDataBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
        localStorage.removeItem('marriageGames');
        games = [];
        loadGameList();
        alert('All game data has been cleared.');
        optionsDropdown.classList.add('hidden');
    }
});

// Show page
function showPage(page) {
    const pages = [homePage, setupPage, gamePage, renamePage];
    pages.forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    setTimeout(() => {
        page.classList.remove('hidden');
        page.classList.add('active');
    }, 50);
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
        li.dataset.index = index;
        li.innerHTML = `
            ${isSelectionMode ? `<input type="checkbox" class="game-select" data-index="${index}">` : ''}
            <span>Game ${index + 1} (${game.players.join(', ')}) - <small>${formatDate(game.lastUpdated)}</small></span>
            <div class="actions">
                <button class="btn small continue-btn" data-index="${index}">Continue</button>
                <button class="delete-icon" data-index="${index}">🗑️</button>
            </div>
        `;
        gameList.appendChild(li);
    });
    deleteSelectedBtn.classList.toggle('hidden', !isSelectionMode);
}

// Handle game list clicks
gameList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const index = parseInt(li.dataset.index);
    const continueBtn = e.target.closest('.continue-btn');
    const deleteIcon = e.target.closest('.delete-icon');
    const checkbox = e.target.closest('.game-select');

    if (deleteIcon) {
        e.stopPropagation();
        deleteGame(index);
    } else if (continueBtn) {
        e.stopPropagation();
        loadGame(index);
    } else if (isSelectionMode) {
        const cb = li.querySelector('.game-select');
        if (cb && !checkbox) {
            cb.checked = !cb.checked;
        }
    } else {
        loadGame(index);
    }
});

// Initialize home page
loadGameList();
showPage(homePage);

// Selection mode
selectGamesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isSelectionMode = !isSelectionMode;
    selectGamesBtn.textContent = isSelectionMode ? 'Cancel Selection' : 'Select Games';
    loadGameList();
    optionsDropdown.classList.add('hidden');
});

// Delete selected games
deleteSelectedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const selected = Array.from(gameList.querySelectorAll('.game-select:checked')).map(cb => parseInt(cb.dataset.index));
    if (selected.length === 0) {
        alert('No games selected.');
        return;
    }
    if (confirm(`Are you sure you want to delete ${selected.length} game(s)?`)) {
        games = games.filter((_, i) => !selected.includes(i));
        if (currentGameIndex !== null && selected.includes(currentGameIndex)) {
            currentGameIndex = null;
            showPage(homePage);
        } else if (currentGameIndex !== null) {
            currentGameIndex = games.findIndex((_, i) => i >= currentGameIndex);
        }
        saveGames();
        isSelectionMode = false;
        selectGamesBtn.textContent = 'Select Games';
        loadGameList();
        optionsDropdown.classList.add('hidden');
    }
});

// Delete single game
function deleteGame(index) {
    if (confirm('Are you sure you want to delete this game?')) {
        games.splice(index, 1);
        if (currentGameIndex === index) {
            currentGameIndex = null;
            showPage(homePage);
        } else if (currentGameIndex > index) {
            currentGameIndex--;
        }
        saveGames();
    }
}

// New game
newGameBtn.addEventListener('click', () => {
    showPage(setupPage);
    playerInputs.innerHTML = `
        <input type="text" class="player-name" placeholder="Player 1" required>
        <input type="text" class="player-name" placeholder="Player 2" required>
    `;
    gameSettingsForm.reset();
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
    } else {
        alert('Maximum 8 players allowed.');
    }
});

// Remove player
removePlayerBtn.addEventListener('click', () => {
    const inputs = playerInputs.querySelectorAll('.player-name');
    if (inputs.length > 2) {
        playerInputs.removeChild(inputs[inputs.length - 1]);
    } else {
        alert('Minimum 2 players required.');
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
    if (new Set(players).size !== players.length) {
        alert('Player names must be unique.');
        return;
    }
    const game = {
        settings: {
            pointRate: parseInt(document.getElementById('point-rate').value) || 1,
            seenPoint: parseInt(document.getElementById('seen-point').value) || 3,
            unseenPoint: parseInt(document.getElementById('unseen-point').value) || 10,
            dubleeBonus: parseInt(document.getElementById('dublee-bonus').value) || 5
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
        div.className = 'player-input';
        div.innerHTML = `
            <h4>${player}</h4>
            <label>Maal:</label>
            <input type="number" min="0" data-player="${player}" class="maal-input" value="0">
            <label>Status:</label>
            <select data-player="${player}" class="status-select">
                <option value="unseen">Unseen</option>
                <option value="seen">Seen</option>
                ${game.players.length >= 4 ? '<option value="dublee">Dublee</option>' : ''}
                <option value="hold">Hold</option>
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
    updateTotalMaal();
    roundForm.reset();
    winnerSelect.value = '';
    showPage(gamePage);
}

// Update total maal display
function updateTotalMaal() {
    const inputs = playerRoundInputs.querySelectorAll('.maal-input');
    const totalMaal = Array.from(inputs).reduce((sum, input) => {
        const value = parseInt(input.value);
        return sum + (isNaN(value) ? 0 : value);
    }, 0);
    calculateBtn.textContent = `Calculate with Total Maal: ${totalMaal}`;
}

// Handle maal and status input
playerRoundInputs.addEventListener('input', (e) => {
    if (e.target.classList.contains('maal-input')) {
        const player = e.target.dataset.player;
        const statusSelect = playerRoundInputs.querySelector(`.status-select[data-player="${player}"]`);
        const maal = parseInt(e.target.value) || 0;
        if (maal > 0 && statusSelect.value === 'unseen') {
            statusSelect.value = 'seen';
        }
        updateTotalMaal();
    }
});

playerRoundInputs.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
        const player = e.target.dataset.player;
        const maalInput = playerRoundInputs.querySelector(`.maal-input[data-player="${player}"]`);
        if (e.target.value === 'unseen' || e.target.value === 'hold') {
            maalInput.value = 0;
            updateTotalMaal();
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
        const maal = parseInt(input.value) || 0;
        round.maal[player] = maal;
        totalMaal += maal;
    });

    let hasInvalidWinnerStatus = false;
    statuses.forEach(select => {
        const player = select.dataset.player;
        round.status[player] = select.value;
        if (player === winner && (select.value === 'unseen' || select.value === 'hold')) {
            hasInvalidWinnerStatus = true;
        }
    });

    if (hasInvalidWinnerStatus) {
        alert('Winner cannot be unseen or on hold.');
        return;
    }

    if (Object.values(round.status).includes('dublee') && game.players.length < 4) {
        alert('Dublee is only available with 4 or more players.');
        return;
    }

    const activePlayers = game.players.filter(p => round.status[p] !== 'hold');
    if (activePlayers.length < 2) {
        alert('At least 2 players must not be on hold.');
        return;
    }

    // Winners cannot be less than 0 Maal
    if (round.maal[winner] < 0) {
        alert('Winner cannot have negative Maal.');
        return;
    }

    // Calculate points
    const { seenPoint, unseenPoint, dubleeBonus, pointRate } = game.settings;
    const numActivePlayers = activePlayers.length;
    const isDubleeWin = round.status[winner] === 'dublee';

    game.players.forEach(player => {
        if (round.status[player] === 'hold') {
            round.points[player] = 0;
            round.amounts[player] = 0;
        } else if (player === winner) {
            let winnerPoints = 0;
            game.players.forEach(other => {
                if (other !== winner && round.status[other] !== 'hold') {
                    let otherPoints = 0;
                    if (round.status[other] === 'seen') {
                        otherPoints = (round.maal[other] * numActivePlayers) - (totalMaal + seenPoint + (isDubleeWin ? dubleeBonus : 0));
                    } else if (round.status[other] === 'unseen') {
                        otherPoints = -(totalMaal + unseenPoint + (isDubleeWin ? dubleeBonus : 0));
                    } else if (round.status[other] === 'dublee') {
                        otherPoints = (round.maal[other] * numActivePlayers) - (totalMaal + (isDubleeWin ? dubleeBonus : 0));
                    }
                    round.points[other] = otherPoints;
                    winnerPoints -= otherPoints;
                }
            });
            round.points[winner] = winnerPoints;
            round.amounts[winner] = winnerPoints * pointRate;
        } else if (round.status[player] === 'seen') {
            round.points[player] = (round.maal[player] * numActivePlayers) - (totalMaal + seenPoint + (isDubleeWin ? dubleeBonus : 0));
            round.amounts[player] = round.points[player] * pointRate;
        } else if (round.status[player] === 'unseen') {
            round.points[player] = -(totalMaal + unseenPoint + (isDubleeWin ? dubleeBonus : 0));
            round.amounts[player] = round.points[player] * pointRate;
        } else if (round.status[player] === 'dublee') {
            round.points[player] = (round.maal[player] * numActivePlayers) - (totalMaal + (isDubleeWin ? dubleeBonus : 0));
            round.amounts[player] = round.points[player] * pointRate;
        }
        game.totals[player] += round.amounts[player];
    });

    game.rounds.push(round);
    game.lastUpdated = new Date().toISOString();
    saveGames();
    renderRounds();
    roundForm.reset();
    winnerSelect.value = '';
    inputs.forEach(input => (input.value = '0'));
    statuses.forEach(select => (select.value = 'unseen'));
    updateTotalMaal();
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
            const className = amount < 0 ? 'payable' : amount > 0 ? 'receivable' : '';
            const statusIcon = round.status[player] === 'seen' ? '👀' :
                             round.status[player] === 'unseen' ? '🙈' :
                             round.status[player] === 'dublee' ? '🎴' : '⏸️';
            const winnerIcon = player === round.winner ? '🏆' : '';
            row.innerHTML += `
                <td>
                    <span class="${className}">${amount}</span>
                    <div class="details">
                        Points: ${round.points[player]} | Maal: ${round.maal[player]}
                        <span class="status-icon">${statusIcon}</span>
                        <span class="winner-icon">${winnerIcon}</span>
                    </div>
                </td>
            `;
        });
        row.innerHTML += `
            <td>
                <button class="edit-btn" onclick="editRound(${index})">✏️</button>
                <button class="delete-btn" onclick="deleteRound(${index})">🗑️</button>
            </td>
        `;
        roundRows.appendChild(row);
    });

    // Total row
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = '<td><strong>Total</strong></td>';
    game.players.forEach(player => {
        const total = game.totals[player];
        const className = total < 0 ? 'payable' : total > 0 ? 'receivable' : '';
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
    updateTotalMaal();
}

// Delete round
function deleteRound(roundIndex) {
    if (confirm('Are you sure you want to delete this round?')) {
        const game = games[currentGameIndex];
        const round = game.rounds[roundIndex];
        game.players.forEach(player => {
            game.totals[player] -= round.amounts[player];
        });
        game.rounds.splice(roundIndex, 1);
        game.lastUpdated = new Date().toISOString();
        saveGames();
        renderRounds();
    }
}

// Rename players
renamePlayersBtn.addEventListener('click', () => {
    const game = games[currentGameIndex];
    renamePlayerInputs.innerHTML = '';
    game.players.forEach(player => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name';
        input.value = player;
        input.required = true;
        renamePlayerInputs.appendChild(input);
    });
    showPage(renamePage);
});

renamePlayersForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const game = games[currentGameIndex];
    const newPlayers = Array.from(renamePlayerInputs.querySelectorAll('.player-name'))
        .map(input => input.value.trim())
        .filter(name => name);
    if (newPlayers.length !== game.players.length) {
        alert('Please provide names for all players.');
        return;
    }
    if (new Set(newPlayers).size !== newPlayers.length) {
        alert('Player names must be unique.');
        return;
    }
    const oldToNew = {};
    game.players.forEach((oldName, i) => {
        oldToNew[oldName] = newPlayers[i];
    });
    game.players = newPlayers;
    game.totals = Object.keys(game.totals).reduce((acc, oldName) => {
        acc[oldToNew[oldName]] = game.totals[oldName];
        return acc;
    }, {});
    game.rounds.forEach(round => {
        round.maal = Object.keys(round.maal).reduce((acc, oldName) => {
            acc[oldToNew[oldName]] = round.maal[oldName];
            return acc;
        }, {});
        round.status = Object.keys(round.status).reduce((acc, oldName) => {
            acc[oldToNew[oldName]] = round.status[oldName];
            return acc;
        }, {});
        round.points = Object.keys(round.points).reduce((acc, oldName) => {
            acc[oldToNew[oldName]] = round.points[oldName];
            return acc;
        }, {});
        round.amounts = Object.keys(round.amounts).reduce((acc, oldName) => {
            acc[oldToNew[oldName]] = round.amounts[oldName];
            return acc;
        }, {});
        if (round.winner) {
            round.winner = oldToNew[round.winner];
        }
    });
    game.lastUpdated = new Date().toISOString();
    saveGames();
    loadGame(currentGameIndex);
});

// Save games to localStorage
function saveGames() {
    try {
        localStorage.setItem('marriageGames', JSON.stringify(games));
        loadGameList();
    } catch (e) {
        alert('Failed to save games. Storage might be full.');
    }
}

// Home button navigation
document.querySelectorAll('.home-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showPage(homePage);
        optionsDropdown.classList.add('hidden');
    });
});