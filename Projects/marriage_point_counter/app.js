class MarriageCardGame {
  constructor() {
      this.games = JSON.parse(localStorage.getItem('marriageGames')) || [];
      this.initializePages();
      this.bindEvents();
  }

  initializePages() {
      this.homePageEl = document.getElementById('home-page');
      this.gameSettingsPageEl = document.getElementById('game-settings-page');
      this.playerEntryPageEl = document.getElementById('player-entry-page');
      this.gameBoardPageEl = document.getElementById('game-board-page');
      this.renderGameList();
  }

  bindEvents() {
      // New Game Button
      document.getElementById('new-game-btn').addEventListener('click', () => this.showGameSettings());

      // Save Settings Button
      document.getElementById('save-settings-btn').addEventListener('click', () => this.saveGameSettings());

      // Start Game Button
      document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

      // Home Buttons
      document.querySelectorAll('.home-btn').forEach(btn => {
          btn.addEventListener('click', () => this.showHomePage());
      });
  }

  renderGameList() {
      const gameListEl = document.getElementById('game-list');
      gameListEl.innerHTML = '';
      
      this.games.forEach((game, index) => {
          const gameEl = document.createElement('div');
          gameEl.classList.add('game-item');
          gameEl.innerHTML = `
              <h3>Game ${index + 1}</h3>
              <p>Last Played: ${new Date(game.lastUpdated).toLocaleString()}</p>
          `;
          gameEl.addEventListener('click', () => this.continueGame(index));
          gameListEl.appendChild(gameEl);
      });
  }

  showGameSettings() {
      this.switchPage(this.gameSettingsPageEl);
  }

  saveGameSettings() {
      const settings = {
          pointRate: parseInt(document.getElementById('point-rate').value),
          seenPoint: parseInt(document.getElementById('seen-point').value),
          unseenPoint: parseInt(document.getElementById('unseen-point').value),
          dubleeBonus: parseInt(document.getElementById('dublee-bonus').value)
      };

      this.switchPage(this.playerEntryPageEl);
      this.renderPlayerInputs();
  }

  renderPlayerInputs() {
      const playerInputsEl = document.getElementById('player-inputs');
      playerInputsEl.innerHTML = '';
      
      for (let i = 0; i < 8; i++) {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = `Player ${i + 1} Name`;
          playerInputsEl.appendChild(input);
      }
  }

  startGame() {
    const playerInputs = document.querySelectorAll('#player-inputs input');
    const players = Array.from(playerInputs)
        .map(input => input.value.trim())
        .filter(name => name !== '');

    if (players.length < 2 || players.length > 8) {
        alert('Please enter 2-8 players');
        return;
    }

    const newGame = {
        players,
        settings: {
            pointRate: parseInt(document.getElementById('point-rate').value),
            seenPoint: parseInt(document.getElementById('seen-point').value),
            unseenPoint: parseInt(document.getElementById('unseen-point').value),
            dubleeBonus: parseInt(document.getElementById('dublee-bonus').value)
        },
        rounds: [],
        lastUpdated: new Date().toISOString()
    };

    this.games.push(newGame);
    this.saveGamesToLocalStorage();
    this.showGameBoard(this.games.length - 1);
}

showGameBoard(gameIndex) {
    this.currentGameIndex = gameIndex;
    const game = this.games[gameIndex];
    
    document.getElementById('game-title').textContent = `Game ${gameIndex + 1}`;
    
    this.switchPage(this.gameBoardPageEl);
    this.renderRounds(game);
    this.setupRoundAddButton(game);
}

renderRounds(game) {
    const roundsContainer = document.getElementById('rounds-container');
    roundsContainer.innerHTML = '';

    game.rounds.forEach((round, roundIndex) => {
        const roundEl = this.createRoundElement(game, round, roundIndex);
        roundsContainer.appendChild(roundEl);
    });
}

createRoundElement(game, round, roundIndex) {
    const roundEl = document.createElement('div');
    roundEl.classList.add('round');
    
    // Winner Selection
    const winnerSelect = document.createElement('select');
    game.players.forEach((player, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = player;
        winnerSelect.appendChild(option);
    });
    winnerSelect.value = round.winnerIndex;
    
    // Player Inputs and Status
    const playerSection = document.createElement('div');
    game.players.forEach((player, playerIndex) => {
        const playerRow = document.createElement('div');
        playerRow.classList.add('player-row');
        
        // Player Name
        const playerNameEl = document.createElement('span');
        playerNameEl.textContent = player;
        
        // Maal Input
        const maalInput = document.createElement('input');
        maalInput.type = 'number';
        maalInput.placeholder = 'Maal';
        maalInput.value = round.playerMaals?.[playerIndex] || 0;
        
        // Status Select
        const statusSelect = document.createElement('select');
        ['unseen', 'seen', 'dublee'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusSelect.appendChild(option);
        });
        statusSelect.value = round.playerStatuses?.[playerIndex] || 'unseen';
        
        playerRow.append(playerNameEl, maalInput, statusSelect);
        playerSection.appendChild(playerRow);
    });
    
    // Calculate Button
    const calculateBtn = document.createElement('button');
    calculateBtn.textContent = 'Calculate Round';
    calculateBtn.addEventListener('click', () => this.calculateRound(game, round, roundIndex));
    
    roundEl.append(winnerSelect, playerSection, calculateBtn);
    return roundEl;
}

calculateRound(game, round, roundIndex) {
    const playerRows = document.querySelectorAll('.player-row');
    const playerMaals = [];
    const playerStatuses = [];
    
    playerRows.forEach(row => {
        const maalInput = row.querySelector('input');
        const statusSelect = row.querySelector('select');
        
        playerMaals.push(parseInt(maalInput.value) || 0);
        playerStatuses.push(statusSelect.value);
    });
    
    const winnerIndex = document.querySelector('select').value;
    
    round.winnerIndex = parseInt(winnerIndex);
    round.playerMaals = playerMaals;
    round.playerStatuses = playerStatuses;
    
    // Calculation logic (simplified version)
    const totalMaal = playerMaals.reduce((a, b) => a + b, 0);
    const results = this.calculatePayableReceivable(game, round);
    
    // Update round with calculation results
    round.results = results;
    
    this.saveGamesToLocalStorage();
    this.renderRounds(game);
}

calculatePayableReceivable(game, round) {
    const { settings } = game;
    const { winnerIndex, playerMaals, playerStatuses } = round;
    const results = [];

    playerMaals.forEach((maal, index) => {
        if (index === winnerIndex) {
            // Winner's calculation
            results.push({
                payable: 0,
                receivable: this.calculateWinnerReceivable(game, round)
            });
        } else {
            results.push(this.calculatePlayerPayableReceivable(game, round, index));
        }
    });

    return results;
}

calculateWinnerReceivable(game, round) {
    // Implement winner receivable calculation logic
    // This is a simplified version and should be refined
    const totalMaal = round.playerMaals.reduce((a, b) => a + b, 0);
    const winnerStatus = round.playerStatuses[round.winnerIndex];
    
    if (winnerStatus === 'seen') {
        return totalMaal - game.settings.seenPoint;
    } else if (winnerStatus === 'dublee') {
        return totalMaal - game.settings.seenPoint - game.settings.dubleeBonus;
    }
    
    return 0;
}

calculatePlayerPayableReceivable(game, round, playerIndex) {
    // Implement player payable/receivable calculation logic
    // This is a simplified version and should be refined
    const { settings } = game;
    const totalMaal = round.playerMaals.reduce((a, b) => a + b, 0);
    const playerStatus = round.playerStatuses[playerIndex];
    const winnerStatus = round.playerStatuses[round.winnerIndex];
    
    if (playerStatus === 'seen' && winnerStatus === 'seen') {
        return {
            payable: -(totalMaal + settings.seenPoint),
            receivable: -(totalMaal + settings.seenPoint)
        };
    } else if (playerStatus === 'unseen' && winnerStatus === 'seen') {
        return {
            payable: -(totalMaal + settings.unseenPoint),
            receivable: 0
        };
    }
    
    return { payable: 0, receivable: 0 };
}

saveGamesToLocalStorage() {
    localStorage.setItem('marriageGames', JSON.stringify(this.games));
}

switchPage(pageEl) {
    // Hide all pages
    [this.homePageEl, this.gameSettingsPageEl, 
     this.playerEntryPageEl, this.gameBoardPageEl]
        .forEach(el => el.classList.remove('active'));
    
    // Show selected page
    pageEl.classList.add('active');
}

showHomePage() {
    this.switchPage(this.homePageEl);
    this.renderGameList();
}

continueGame(gameIndex) {
    this.showGameBoard(gameIndex);
}
}



  // Initialize the app when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
      const marriageCardGame = new MarriageCardGame();
  });
  
  // Utility Functions for Advanced Calculations
  function calculateMarriageGamePoints(gameSettings, roundData) {
      const {
          pointRate,
          seenPoint,
          unseenPoint,
          dubleeBonus
      } = gameSettings;
  
      const players = roundData.players;
      const winner = roundData.winner;
      const totalMaal = players.reduce((sum, player) => sum + player.maal, 0);
  
      // Detailed point calculation logic
      const pointCalculations = players.map((player, index) => {
          // Winner calculation
          if (index === winner.index) {
              return calculateWinnerPoints(player, winner, totalMaal, gameSettings);
          }
  
          // Other players calculation based on their status
          return calculateOtherPlayerPoints(player, winner, totalMaal, gameSettings);
      });
  
      // Apply point rate to final calculations
      return pointCalculations.map(calc => ({
          ...calc,
          payable: calc.payable * pointRate,
          receivable: calc.receivable * pointRate
      }));
  }
  
  function calculateWinnerPoints(player, winner, totalMaal, gameSettings) {
      const { seenPoint, dubleeBonus } = gameSettings;
      
      if (winner.status === 'seen') {
          return {
              payable: 0,
              receivable: (player.maal * players.length) - (totalMaal + seenPoint)
          };
      }
  
      if (winner.status === 'dublee') {
          return {
              payable: 0,
              receivable: (player.maal * players.length) - (totalMaal + seenPoint + dubleeBonus)
          };
      }
  }
  
  function calculateOtherPlayerPoints(player, winner, totalMaal, gameSettings) {
      const { seenPoint, unseenPoint, dubleeBonus } = gameSettings;
  
      // Seen player with seen winner
      if (player.status === 'seen' && winner.status === 'seen') {
          return {
              payable: (player.maal * players.length) - (totalMaal + seenPoint),
              receivable: 0
          };
      }
  
      // Unseen player with seen winner
      if (player.status === 'unseen' && winner.status === 'seen') {
          return {
              payable: 0 - (totalMaal + unseenPoint),
              receivable: 0
          };
      }
  
      // Seen player with dublee winner
      if (player.status === 'seen' && winner.status === 'dublee') {
          return {
              payable: (player.maal * players.length) - (totalMaal + seenPoint + dubleeBonus),
              receivable: 0
          };
      }
  
      // Unseen player with dublee winner
      if (player.status === 'unseen' && winner.status === 'dublee') {
          return {
              payable: 0 - (totalMaal + unseenPoint + dubleeBonus),
              receivable: 0
          };
      }
  
      // Dublee players not winning
      if (player.status === 'dublee') {
          return {
              payable: 0,
              receivable: 0
          };
      }
  }
  
  // Error Handling and Validation Middleware
  class GameValidator {
      static validateGameSettings(settings) {
          const errors = [];
  
          if (settings.pointRate < 1) 
              errors.push("Point rate must be at least 1");
          
          if (settings.seenPoint < 0) 
              errors.push("Seen point cannot be negative");
          
          if (settings.unseenPoint < 0) 
              errors.push("Unseen point cannot be negative");
          
          if (settings.dubleeBonus < 0) 
              errors.push("Dublee bonus cannot be negative");
  
          return errors;
      }
  
      static validatePlayers(players) {
          const errors = [];
  
          if (players.length < 2) 
              errors.push("Minimum 2 players required");
          
          if (players.length > 8) 
              errors.push("Maximum 8 players allowed");
          
          const uniquePlayers = new Set(players);
          if (uniquePlayers.size !== players.length) 
              errors.push("Player names must be unique");
  
          return errors;
      }
  }
  
  // Logging and Analytics (Optional)
  class GameLogger {
      static logGameStart(gameData) {
          console.log('Game Started:', {
              timestamp: new Date(),
              playerCount: gameData.players.length,
              settings: gameData.settings
          });
      }
  
      static logRoundCalculation(roundData) {
          console.log('Round Calculated:', {
              timestamp: new Date(),
              roundDetails: roundData
          });
      }
  }
  
  // Export for potential future module usage
  export {
      MarriageCardGame,
      calculateMarriageGamePoints,
      GameValidator,
      GameLogger
  };