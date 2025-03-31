// Global variables
let selectedGameId = null;
const API_URL = 'https://goldfish-app-cqju6.ondigitalocean.app/api';

// DOM Elements
const displayNameEl = document.getElementById('displayName');
const apiCallsEl = document.getElementById('apiCalls');
const gameListEl = document.getElementById('game-list');
const selectedGameEl = document.getElementById('selected-game');
const gameDetailsEl = document.getElementById('game-details');
const generateBtn = document.getElementById('generate-btn');
const summaryContainerEl = document.getElementById('summary-container');
const summaryContentEl = document.getElementById('summary-content');
const apiWarningEl = document.getElementById('api-warning');

document.addEventListener('DOMContentLoaded', async () => {
  await getUserProfile();
  await loadRecentGames();
  
  document.getElementById('dashboardBtn').addEventListener('click', () => {
    window.location.href = 'user.html';
  });
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
  });
  
  generateBtn.addEventListener('click', generateSummary);
});

async function getUserProfile() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    displayNameEl.innerText = `Welcome, ${decodedToken.email}`;
    
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    apiCallsEl.textContent = data.apiCallsRemaining;
    
    if (data.apiCallsRemaining <= 0) {
      apiWarningEl.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
  }
}

async function loadRecentGames() {
  const token = localStorage.getItem('authToken');
  
  try {
    document.querySelector('.loading').style.display = 'block';
    gameListEl.innerHTML = '';
    
    const response = await fetch(`${API_URL}/nhl/games`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch NHL games');
    }
    
    const result = await response.json();
    document.querySelector('.loading').style.display = 'none';
    
    if (result.data && result.data.length > 0) {
      renderGameList(result.data);
    } else {
      gameListEl.innerHTML = '<p>No recent games found.</p>';
    }
  } catch (error) {
    console.error('Error loading NHL games:', error);
    document.querySelector('.loading').style.display = 'none';
    gameListEl.innerHTML = '<p>Error loading games. Please try again later.</p>';
  }
}

function renderGameList(games) {
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.dataset.id = game.gameId;
    
    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString();
    
    gameCard.innerHTML = `
      <div class="teams">${game.homeTeam} vs ${game.awayTeam}</div>
      <div class="score">${game.homeScore} - ${game.awayScore}</div>
      <div class="date">${formattedDate}</div>
      <div class="venue">${game.venue || 'Unknown Venue'}</div>
    `;
    
    gameCard.addEventListener('click', () => selectGame(game));
    gameListEl.appendChild(gameCard);
  });
}

async function selectGame(game) {
  document.querySelectorAll('.game-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  document.querySelector(`.game-card[data-id="${game.gameId}"]`).classList.add('selected');
  
  selectedGameId = game.gameId;
  
  await getGameDetails(game.gameId);
  
  selectedGameEl.classList.remove('hidden');
  
  summaryContainerEl.classList.add('hidden');
}

async function getGameDetails(gameId) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_URL}/nhl/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch game details');
    }
    
    const result = await response.json();
    const game = result.data;
    
    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString();
    
    let periodScoresHTML = '<h4>Period Scores</h4><ul>';
    game.periodScores.forEach(period => {
      periodScoresHTML += `<li>${period.period}: ${game.homeTeam} ${period.homeScore}, ${game.awayTeam} ${period.awayScore}</li>`;
    });
    periodScoresHTML += '</ul>';
    
    let scoringPlaysHTML = '<h4>Scoring Plays</h4><ul>';
    game.scoringPlays.forEach(play => {
      scoringPlaysHTML += `<li>${play.period} Period, ${play.periodTime} - ${play.description}</li>`;
    });
    scoringPlaysHTML += '</ul>';
    
    gameDetailsEl.innerHTML = `
      <h3>${game.homeTeam} vs ${game.awayTeam}</h3>
      <p><strong>Final Score:</strong> ${game.homeTeam} ${game.homeScore}, ${game.awayTeam} ${game.awayScore}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Venue:</strong> ${game.venue}</p>
      <p><strong>Shots on Goal:</strong> ${game.homeTeam} ${game.homeShots}, ${game.awayTeam} ${game.awayShots}</p>
      ${periodScoresHTML}
      ${scoringPlaysHTML}
    `;
    
  } catch (error) {
    console.error('Error fetching game details:', error);
    gameDetailsEl.innerHTML = '<p>Error loading game details. Please try again.</p>';
  }
}

async function generateSummary() {
  if (!selectedGameId) {
    alert('Please select a game first');
    return;
  }
  
  const token = localStorage.getItem('authToken');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  
  try {
    const response = await fetch(`${API_URL}/summary/generate-nhl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ gameId: selectedGameId })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      summaryContentEl.textContent = result.data.summary;
      summaryContainerEl.classList.remove('hidden');
      
      summaryContainerEl.scrollIntoView({ behavior: 'smooth' });
      
      if (result.warning) {
        apiWarningEl.classList.remove('hidden');
        apiWarningEl.textContent = result.warning;
      }
      
      await getUserProfile();
    } else {
      alert(result.message || 'Failed to generate summary');
      
      if (result.message.includes('all your free API calls')) {
        apiWarningEl.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    alert('An error occurred while generating the summary');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Summary';
  }
}