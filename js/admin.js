async function displayUserDashboard() {
  const token = localStorage.getItem("authToken");

  const displayNameEl = document.getElementById("displayName");
  const endPointsContainer = document.getElementById("endPointsTable");
  const tableContainer = document.getElementById("userTable");

  if (!token) {
    displayNameEl.innerText = "Not logged in";
    tableContainer.innerText = "";
    endPointsContainer.innerText = "";
    return;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    displayNameEl.innerText = `Welcome, ${decodedToken.email}`;

    const response = await fetch(
      "https://goldfish-app-cqju6.ondigitalocean.app/api/users/profile",
      // "http://localhost:8003/api/users/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const result = await response.json();

    // If admin, render both tables
    if (result.isAdmin && Array.isArray(result.userData)) {
      // ========== User Table ==========
      let userTableHTML = `
        <table border="1">
          <thead>
            <tr>
              <th>Email</th>
              <th>API Usages Left</th>
              <th>Total Requests (GET + POST)</th>
            </tr>
          </thead>
          <tbody>
      `;

      // add total requests based on get/post
      result.userData.forEach((user) => {
        const totalRequests =
          (user.getRequests || 0) + (user.postRequests || 0);
        userTableHTML += `
          <tr>
            <td>${user.email}</td>
            <td>${user.apiCallsRemaining}</td>
            <td>${totalRequests}</td>
          </tr>
        `;
      });

      userTableHTML += `</tbody></table>`;
      tableContainer.innerHTML = userTableHTML;

      // ========== Endpoint Stats Table ==========
      if (Array.isArray(result.endpointStats)) {
        let endpointHTML = `
          <table border="1">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
        `;

        result.endpointStats.forEach((stat) => {
          endpointHTML += `
            <tr>
              <td>${stat.method}</td>
              <td>${stat.path}</td>
              <td>${stat.count}</td>
            </tr>
          `;
        });

        endpointHTML += `</tbody></table>`;
        endPointsContainer.innerHTML = endpointHTML;
      } else {
        endPointsContainer.innerHTML = "<p>No endpoint stats found.</p>";
      }
    } else {
      // Regular user view
      tableContainer.innerHTML = `
        <p>Your API calls remaining: ${result.apiCallsRemaining}</p>
        <p>Your Data: ${JSON.stringify(result.userData)}</p>
      `;
      endPointsContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error displaying dashboard:", error);
    tableContainer.innerText = "Failed to load data.";
    endPointsContainer.innerText = "Failed to load endpoint stats.";
  }
}

displayUserDashboard();

document.getElementById("toUserPage").addEventListener("click", () => {
  window.location.href = "user.html";
});

document.getElementById("logOut").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isAdmin");
  window.location.href = "login.html";
});
