import { messages } from "../messages.js";

class UserDashboard {
  constructor() {
    this.displayNameElement = document.getElementById("displayName");
    this.adminButton = document.getElementById("adminOnly");
    this.logoutButton = document.getElementById("logOut");
    this.summaryButton = document.getElementById("summary");
    this.nhlSummaryButton = document.getElementById("nhlSummary");
    this.profileButton = document.getElementById("profile");

    this.init();
  }

  init() {
    this.displayUserEmail();
    this.setupLogout();
    this.setupGetSummary();
    this.setupNhlSummary();
    this.setupUpdateProfile();
  }

  displayUserEmail() {
    const token = localStorage.getItem("authToken");

    if (!token) {
      this.displayNameElement.innerText = messages.notLoggedIn;
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      this.displayNameElement.innerText = messages.welcome(decodedToken.email);

      if (decodedToken.isAdmin) {
        this.adminButton.style.display = "block";
        this.adminButton.addEventListener("click", () => {
          window.location.href = "admin.html";
        });
      } else {
        this.adminButton.style.display = "none";
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      this.displayNameElement.innerText = messages.userDisplayError;
    }
  }

  setupGetSummary() {
    this.summaryButton.addEventListener("click", () => {
      window.location.href = "summary.html";
    });
  }

  setupNhlSummary() {
    this.nhlSummaryButton.addEventListener("click", () => {
      window.location.href = "nhl-summary.html";
    });
  }

  setupUpdateProfile() {
    this.profileButton.addEventListener("click", () => {
      window.location.href = "userProfile.html";
    });
  }

  setupLogout() {
    this.logoutButton.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdmin");
      window.location.href = "login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UserDashboard();
});
