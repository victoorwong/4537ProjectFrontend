import { messages } from "../messages.js";

// Global variables
let selectedGameId = null;
const API_URL = "https://goldfish-app-cqju6.ondigitalocean.app/api";

// DOM Elements
const displayNameEl = document.getElementById("displayName");
const apiCallsEl = document.getElementById("apiCalls");
const gameListEl = document.getElementById("game-list");
const selectedGameEl = document.getElementById("selected-game");
const gameDetailsEl = document.getElementById("game-details");
const generateBtn = document.getElementById("generate-btn");
const summaryContainerEl = document.getElementById("summary-container");
const summaryContentEl = document.getElementById("summary-content");
const apiWarningEl = document.getElementById("api-warning");
const userSummariesEl = document.getElementById("user-summaries");
const summaryListEl = document.getElementById("summary-list");

document.addEventListener("DOMContentLoaded", async () => {
  await getUserProfile();
  await loadRecentGames();
  await loadUserSummaries();

  document.getElementById("dashboardBtn").addEventListener("click", () => {
    window.location.href = "user.html";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
  });

  generateBtn.addEventListener("click", generateSummary);
});

async function getUserProfile() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    displayNameEl.innerText = `Welcome, ${decodedToken.email}`;

    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    const apiCallsRemaining =
      data.apiUsage?.apiCallsRemaining ?? data.apiCallsRemaining ?? 0;

    apiCallsEl.textContent = apiCallsRemaining;

    if (apiCallsRemaining <= 0) {
      apiWarningEl.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
  }
}

async function loadRecentGames() {
  const token = localStorage.getItem("authToken");

  try {
    document.querySelector(".loading").style.display = "block";
    gameListEl.innerHTML = "";

    const response = await fetch(`${API_URL}/nhl/games`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(messages.fetchGamesError);
    }

    const result = await response.json();
    document.querySelector(".loading").style.display = "none";

    if (result.data && result.data.length > 0) {
      renderGameList(result.data);
    } else {
      gameListEl.innerHTML = `<p>${messages.noGames}</p>`;
    }
  } catch (error) {
    console.error("Error loading NHL games:", error);
    document.querySelector(".loading").style.display = "none";
    gameListEl.innerHTML = `<p>${messages.loadGamesError}</p>`;
  }
}

function renderGameList(games) {
  games.forEach((game) => {
    const gameCard = document.createElement("div");
    gameCard.className = "game-card";
    gameCard.dataset.id = game.gameId;

    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString();

    gameCard.innerHTML = `
      <div class="teams">${game.homeTeam} vs ${game.awayTeam}</div>
      <div class="score">${game.homeScore} - ${game.awayScore}</div>
      <div class="date">${formattedDate}</div>
      <div class="venue">${game.venue || messages.unknownVenue}</div>
    `;

    gameCard.addEventListener("click", () => selectGame(game));
    gameListEl.appendChild(gameCard);
  });
}

async function selectGame(game) {
  document.querySelectorAll(".game-card").forEach((card) => {
    card.classList.remove("selected");
  });

  document
    .querySelector(`.game-card[data-id="${game.gameId}"]`)
    .classList.add("selected");

  selectedGameId = game.gameId;

  await getGameDetails(game.gameId);

  selectedGameEl.classList.remove("hidden");

  summaryContainerEl.classList.add("hidden");
}

async function getGameDetails(gameId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`${API_URL}/nhl/game/${gameId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch game details");
    }

    const result = await response.json();
    const game = result.data;

    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString();

    let periodScoresHTML = "<h4>Period Scores</h4><ul>";
    game.periodScores.forEach((period) => {
      periodScoresHTML += `<li>${period.period}: ${game.homeTeam} ${period.homeScore}, ${game.awayTeam} ${period.awayScore}</li>`;
    });
    periodScoresHTML += "</ul>";

    let scoringPlaysHTML = "<h4>Scoring Plays</h4><ul>";
    game.scoringPlays.forEach((play) => {
      scoringPlaysHTML += `<li>${play.period} Period, ${play.periodTime} - ${play.description}</li>`;
    });
    scoringPlaysHTML += "</ul>";

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
    console.error("Error fetching game details:", error);
    gameDetailsEl.innerHTML = `<p>${messages.gameDetailsError}</p>`;
  }
}

async function generateSummary() {
  if (!selectedGameId) {
    alert(messages.selectGameFirst);
    return;
  }

  const token = localStorage.getItem("authToken");
  generateBtn.disabled = true;
  generateBtn.textContent = messages.generating;

  try {
    const response = await fetch(`${API_URL}/summary/generate-nhl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ gameId: selectedGameId }),
    });

    const result = await response.json();

    if (response.ok) {
      summaryContentEl.textContent = result.data.summary;
      summaryContainerEl.classList.remove("hidden");

      summaryContainerEl.scrollIntoView({ behavior: "smooth" });

      if (result.warning) {
        apiWarningEl.classList.remove("hidden");
        apiWarningEl.textContent = result.warning;
      }

      await getUserProfile();
    } else {
      alert(result.message || messages.summaryGenFailed);

      if (result.message.includes("all your free API calls")) {
        apiWarningEl.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    alert(messages.summaryGenError);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Summary";
  }
}

async function loadUserSummaries() {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`${API_URL}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success && result.data.length > 0) {
      summaryListEl.innerHTML = "";
      result.data.forEach((summary) => {
        const li = document.createElement("li");
        const date = new Date(summary.gameDetails.date).toLocaleDateString();

        li.innerHTML = `
          <strong>${summary.gameDetails.homeTeam} vs ${summary.gameDetails.awayTeam}</strong> 
          (${summary.gameDetails.homeScore}-${summary.gameDetails.awayScore}) on ${date}
          <br />
          ${summary.summary}
          <br />
          <button onclick="deleteSummary('${summary._id}')">Delete</button>
          <hr />
        `;
        summaryListEl.appendChild(li);
      });

      userSummariesEl.classList.remove("hidden");
    } else {
      summaryListEl.innerHTML = `<li>${messages.noSummaries}</li>`;
      userSummariesEl.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error loading user summaries:", error);
  }
}

async function deleteSummary(summaryId) {
  const token = localStorage.getItem("authToken");

  if (!confirm(messages.confirmDelete)) return;

  try {
    const response = await fetch(`${API_URL}/summary/${summaryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      alert(messages.deleteSuccess);
      await loadUserSummaries();
    } else {
      alert(result.message || messages.deleteFail);
    }
  } catch (error) {
    console.error("Error deleting summary:", error);
    alert(messages.deleteError);
  }
}
