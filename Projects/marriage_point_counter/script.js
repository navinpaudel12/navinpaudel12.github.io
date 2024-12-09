document.addEventListener("DOMContentLoaded", () => {
    const homeButton = document.getElementById("homeButton");
    const newGameButton = document.getElementById("newGameButton");
    const mainContent = document.getElementById("mainContent");
    const gameSettings = document.getElementById("gameSettings");
    const playerNames = document.getElementById("playerNames");
    const gameRound = document.getElementById("gameRound");
    const settingsForm = document.getElementById("settingsForm");
    const playerForm = document.getElementById("playerForm");
    const rounds = document.getElementById("rounds");
    const calculateTotal = document.getElementById("calculateTotal");
    
    let games = JSON.parse(localStorage.getItem("games")) || [];
    let currentGame = null;
  
    homeButton.addEventListener("click", () => {
      mainContent.style.display = "block";
      gameSettings.style.display = "none";
      playerNames.style.display = "none";
      gameRound.style.display = "none";
    });
    
    newGameButton.addEventListener("click", () => {
      mainContent.style.display = "none";
      gameSettings.style.display = "block";
    });
  
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      currentGame = {
        pointRate: parseInt(document.getElementById("pointRate").value),
        seenPoint: parseInt(document.getElementById("seenPoint").value),
        unseenPoint: parseInt(document.getElementById("unseenPoint").value),
        dubleeBonus: parseInt(document.getElementById("dubleeBonus").value),
        players: [],
        rounds: []
      };
      gameSettings.style.display = "none";
      playerNames.style.display = "block";
      displayPlayerInputs();
    });
  
    playerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const playerCount = parseInt(document.getElementById("playerCount").value);
      currentGame.players = [];
      for (let i = 0; i < playerCount; i++) {
        const playerName = document.getElementById(`playerName${i}`).value;
        currentGame.players.push({ name: playerName, status: "unseen", maal: 0 });
      }
      playerNames.style.display = "none";
      gameRound.style.display = "block";
      displayRounds();
    });
  
    function displayPlayerInputs() {
      const playerCount = parseInt(document.getElementById("playerCount").value);
      const playerInputs = document.getElementById("playerInputs");
      playerInputs.innerHTML = "";
      for (let i = 0; i < playerCount; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.id = `playerName${i}`;
        input.placeholder = `Player ${i + 1} Name`;
        input.required = true;
        playerInputs.appendChild(input);
      }
    }
  
    function displayRounds() {
      rounds.innerHTML = "";
      currentGame.rounds.forEach((round, index) => {
        const roundDiv = document.createElement("div");
        roundDiv.innerHTML = `<strong>Round ${index + 1}</strong><br>`;
        // Add code to display round details and player inputs
        rounds.appendChild(roundDiv);
      });
      const newRoundDiv = document.createElement("div");
      newRoundDiv.innerHTML = `<strong>New Round</strong><br>`;
      // Add code to create new round inputs
      rounds.appendChild(newRoundDiv);
    }
    
    calculateTotal.addEventListener("click", () => {
      // Add code to calculate total payable/receivable amounts
    });
    
    function saveGame() {
      const existingGameIndex = games.findIndex(game => game.id === currentGame.id);
      if (existingGameIndex > -1) {
        games[existingGameIndex] = currentGame;
      } else {
        games.push(currentGame);
      }
      localStorage.setItem("games", JSON.stringify(games));
    }
  });
  