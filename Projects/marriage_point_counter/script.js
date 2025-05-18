// Game data storage
let games = JSON.parse(localStorage.getItem('marriageGames')) || [];

// DOM elements
const homePage = document.getElementById('home-page');
const setupPage = document.getElementById('setup-page');
const gamePage = document.getElementById('game-page');
const settingsPage = document.getElementById('settings-page');
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
const roundInputTable = document.getElementById('round-input-table');
const playerHeaders = document.getElementById('player-headers');
const roundRows = document.getElementById('round-rows');
const gameTitle = document.getElementById('game-title');
const calculateBtn = document.getElementById('calculate-btn');
const gameSettingsBtn = document.getElementById('game-settings-btn');
const gameSettingsUpdateForm = document.getElementById('game-settings-update-form');
const updatePlayerInputs = document.getElementById('update-player-inputs');
const addNewPlayerBtn = document.getElementById('add-new-player-btn');
const selectGamesBtn = document.getElementById('select-games-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const themeToggle = document.getElementById('theme-toggle');
const optionsBtn = document.getElementById('options-btn');
const optionsDropdown = document.getElementById('options-dropdown');
const foulMemberSelect = document.getElementById('foul-member-select');
const foulInfoBtn = document.getElementById('foul-info-btn');

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
optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    optionsDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!optionsBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
        optionsDropdown.classList.add('hidden');
    }
});

// Foul info prompt
foulInfoBtn.addEventListener('click', () => {
    alert('Foul member is who made mistake while dealing the card must have to pay the foul point.');
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
    const pages = [homePage, setupPage, gamePage, settingsPage];
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
    document.getElementById('dealer-foul-point').value = 15;
});

// Add player (setup page)
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

// Remove player (setup page)
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
    try {
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
                dubleeBonus: parseInt(document.getElementById('dublee-bonus').value) || 5,
                dealerFoulPoint: parseInt(document.getElementById('dealer-foul-point').value) || 15
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
        showPage(gamePage);
    } catch (error) {
        console.error('Error saving new game:', error);
        alert('Failed to save new game. Please try again.');
    }
});

// Load game
function loadGame(index) {
    try {
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

        // Setup foul member select
        foulMemberSelect.innerHTML = '<option value="none">None</option>';
        game.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            foulMemberSelect.appendChild(option);
        });

        // Setup round input table
        playerRoundInputs.innerHTML = '';
        game.players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player}</td>
                <td><input type="number" min="0" data-player="${player}" class="maal-input" value="0"></td>
                <td>
                    <select data-player="${player}" class="status-select">
                        <option value="unseen">Unseen</option>
                        <option value="seen">Seen</option>
                        ${game.players.length >= 4 ? '<option value="dublee">Dublee</option>' : ''}
                        <option value="hold">Hold</option>
                    </select>
                </td>
                <td><button type="button" class="set-winner-btn" data-player="${player}">👑</button></td>
            `;
            playerRoundInputs.appendChild(row);
        });

        // Set readonly for hold status during initialization
        playerRoundInputs.querySelectorAll('.status-select').forEach(select => {
            const player = select.dataset.player;
            const maalInput = playerRoundInputs.querySelector(`.maal-input[data-player="${player}"]`);
            if (select.value === 'hold') {
                maalInput.value = 0;
                maalInput.setAttribute('readonly', 'readonly');
            }
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
        foulMemberSelect.value = 'none';
        showPage(gamePage);
    } catch (error) {
        console.error('Error loading game:', error);
        alert('Failed to load game. Returning to home page.');
        showPage(homePage);
    }
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

// Handle maal, status, and set winner
roundInputTable.addEventListener('input', (e) => {
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

roundInputTable.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
        const player = e.target.dataset.player;
        const maalInput = playerRoundInputs.querySelector(`.maal-input[data-player="${player}"]`);
        if (e.target.value === 'unseen' || e.target.value === 'hold') {
            maalInput.value = 0;
            if (e.target.value === 'hold') {
                maalInput.setAttribute('readonly', 'readonly');
            } else {
                maalInput.removeAttribute('readonly');
            }
            updateTotalMaal();
        } else {
            maalInput.removeAttribute('readonly');
        }
    }
});

roundInputTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('set-winner-btn')) {
        const player = e.target.dataset.player;
        winnerSelect.value = player;
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
        amounts: {},
        foulMember: foulMemberSelect.value
    };

    let totalMaal = 0;
    const inputs = playerRoundInputs.querySelectorAll('.maal-input');
    const statuses = playerRoundInputs.querySelectorAll('.status-select');

    // Validate hold status has zero maal
    let hasInvalidHold = false;
    inputs.forEach(input => {
        const player = input.dataset.player;
        const maal = parseInt(input.value) || 0;
        const statusSelect = playerRoundInputs.querySelector(`.status-select[data-player="${player}"]`);
        if (statusSelect.value === 'hold' && maal !== 0) {
            hasInvalidHold = true;
        }
        round.maal[player] = maal;
        totalMaal += maal;
    });

    if (hasInvalidHold) {
        alert('Players with "Hold" status must have zero maal.');
        return;
    }

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

    // Calculate points
    const { seenPoint, unseenPoint, dubleeBonus, pointRate, dealerFoulPoint } = game.settings;
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
    });

    // Handle foul member
    if (round.foulMember !== 'none') {
        const foulAmount = dealerFoulPoint * pointRate;
        round.amounts[round.foulMember] -= foulAmount;
        const otherPlayers = game.players.filter(p => p !== round.foulMember && round.status[p] !== 'hold');
        const share = foulAmount / (otherPlayers.length || 1);
        otherPlayers.forEach(player => {
            round.amounts[player] += share;
        });
    }

    // Update game.totals
    game.players.forEach(player => {
        game.totals[player] = (game.totals[player] || 0) + (round.amounts[player] || 0);
    });

    game.rounds.push(round);
    game.lastUpdated = new Date().toISOString();
    saveGames();
    renderRounds();
    roundForm.reset();
    winnerSelect.value = '';
    foulMemberSelect.value = 'none';
    inputs.forEach(input => {
        input.value = '0';
        input.removeAttribute('readonly');
    });
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
            const amount = round.amounts[player] || 0;
            const className = amount < 0 ? 'payable' : amount > 0 ? 'receivable' : '';
            const statusIcon = round.status[player] === 'seen' ? '👀' :
                             round.status[player] === 'unseen' ? '🙈' :
                             round.status[player] === 'dublee' ? '🎴' : '⏸️';
            const winnerIcon = player === round.winner ? '🏆' : '';
            const foulNote = round.foulMember === player ? ' (Foul)' : '';
            row.innerHTML += `
                <td>
                    <span class="${className}">${amount}${foulNote}</span>
                    <div class="details">
                        Points: ${round.points[player] || 0} | Maal: ${round.maal[player] || 0}
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
        const total = game.totals[player] || 0;
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
        game.totals[player] = (game.totals[player] || 0) - (round.amounts[player] || 0);
    });

    // Populate form
    winnerSelect.value = round.winner;
    foulMemberSelect.value = round.foulMember || 'none';
    playerRoundInputs.querySelectorAll('.maal-input').forEach(input => {
        input.value = round.maal[input.dataset.player] || 0;
        const statusSelect = playerRoundInputs.querySelector(`.status-select[data-player="${input.dataset.player}"]`);
        if (statusSelect.value === 'hold') {
            input.setAttribute('readonly', 'readonly');
        } else {
            input.removeAttribute('readonly');
        }
    });
    playerRoundInputs.querySelectorAll('.status-select').forEach(select => {
        select.value = round.status[select.dataset.player] || 'unseen';
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
        // Deduct round amounts from totals
        game.players.forEach(player => {
            game.totals[player] = (game.totals[player] || 0) - (round.amounts[player] || 0);
        });
        game.rounds.splice(roundIndex, 1);
        game.lastUpdated = new Date().toISOString();
        saveGames();
        renderRounds();
    }
}

// Game settings
gameSettingsBtn.addEventListener('click', () => {
    const game = games[currentGameIndex];
    document.getElementById('update-point-rate').value = game.settings.pointRate;
    document.getElementById('update-seen-point').value = game.settings.seenPoint;
    document.getElementById('update-unseen-point').value = game.settings.unseenPoint;
    document.getElementById('update-dublee-bonus').value = game.settings.dubleeBonus;
    document.getElementById('update-dealer-foul-point').value = game.settings.dealerFoulPoint;
    updatePlayerInputs.innerHTML = '';
    game.players.forEach(player => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name';
        input.value = player;
        input.required = true;
        updatePlayerInputs.appendChild(input);
    });
    showPage(settingsPage);
});

// Add new player (settings page)
addNewPlayerBtn.addEventListener('click', () => {
    const inputs = updatePlayerInputs.querySelectorAll('.player-name');
    if (inputs.length < 8) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name';
        input.placeholder = `Player ${inputs.length + 1}`;
        input.required = true;
        updatePlayerInputs.appendChild(input);
    } else {
        alert('Maximum 8 players allowed.');
    }
});

gameSettingsUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const game = games[currentGameIndex];
    const newPlayers = Array.from(updatePlayerInputs.querySelectorAll('.player-name'))
        .map(input => input.value.trim())
        .filter(name => name);
    if (newPlayers.length < 2 || newPlayers.length > 8) {
        alert('Please provide 2 to 8 players.');
        return;
    }
    if (new Set(newPlayers).size !== newPlayers.length) {
        alert('Player names must be unique.');
        return;
    }

    // Identify added players
    const addedPlayers = newPlayers.filter(p => !game.players.includes(p));
    const oldPlayers = game.players.filter(p => newPlayers.includes(p));
    if (addedPlayers.length > 0) {
        addedPlayers.forEach(newPlayer => {
            game.totals[newPlayer] = 0;
            game.rounds.forEach(round => {
                round.maal[newPlayer] = 0;
                round.status[newPlayer] = 'hold';
                round.points[newPlayer] = 0;
                round.amounts[newPlayer] = 0;
            });
        });
    }

    // Update player names
    const oldToNew = {};
    game.players.forEach((oldName, i) => {
        if (i < oldPlayers.length) {
            oldToNew[oldName] = newPlayers[i];
        }
    });

    game.players = newPlayers;
    game.totals = Object.keys(game.totals).reduce((acc, oldName) => {
        const newName = oldToNew[oldName] || oldName;
        acc[newName] = game.totals[oldName];
        return acc;
    }, {});
    game.rounds.forEach(round => {
        round.maal = Object.keys(round.maal).reduce((acc, oldName) => {
            const newName = oldToNew[oldName] || oldName;
            acc[newName] = round.maal[oldName];
            return acc;
        }, {});
        round.status = Object.keys(round.status).reduce((acc, oldName) => {
            const newName = oldToNew[oldName] || oldName;
            acc[newName] = round.status[oldName];
            return acc;
        }, {});
        round.points = Object.keys(round.points).reduce((acc, oldName) => {
            const newName = oldToNew[oldName] || oldName;
            acc[newName] = round.points[oldName];
            return acc;
        }, {});
        round.amounts = Object.keys(round.amounts).reduce((acc, oldName) => {
            const newName = oldToNew[oldName] || oldName;
            acc[newName] = round.amounts[oldName];
            return acc;
        }, {});
        if (round.winner && oldToNew[round.winner]) {
            round.winner = oldToNew[round.winner];
        }
        if (round.foulMember && round.foulMember !== 'none' && oldToNew[round.foulMember]) {
            round.foulMember = oldToNew[round.foulMember];
        }
    });

    game.settings = {
        pointRate: parseInt(document.getElementById('update-point-rate').value) || 1,
        seenPoint: parseInt(document.getElementById('update-seen-point').value) || 3,
        unseenPoint: parseInt(document.getElementById('update-unseen-point').value) || 10,
        dubleeBonus: parseInt(document.getElementById('update-dublee-bonus').value) || 5,
        dealerFoulPoint: parseInt(document.getElementById('update-dealer-foul-point').value) || 15
    };
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
        console.error('Error saving games:', e);
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