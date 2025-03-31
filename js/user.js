class UserDashboard {
  constructor() {
    this.displayNameElement = document.getElementById("displayName");
    this.adminButton = document.getElementById("adminOnly");
    this.logoutButton = document.getElementById("logOut");
    this.summaryButton = document.getElementById("summary");
    this.nhlSummaryButton = document.getElementById("nhlSummary"); 

    this.init();
  }

  init() {
    this.displayUserEmail();
    this.setupLogout();
    this.setupGetSummary();
    this.setupNhlSummary();
  }

  displayUserEmail() {
    const token = localStorage.getItem("authToken");

    if (!token) {
      this.displayNameElement.innerText = "Not logged in";
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      this.displayNameElement.innerText = `Welcome, ${decodedToken.email}`;

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
      this.displayNameElement.innerText = "Error displaying user";
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
