import { messages } from "../messages.js";

async function displayUserDashboard() {
  const token = localStorage.getItem("authToken");

  const displayNameEl = document.getElementById("displayName");
  const endPointsContainer = document.getElementById("endPointsTable");
  const tableContainer = document.getElementById("userTable");

  if (!token) {
    displayNameEl.innerText = messages.notLoggedIn;
    tableContainer.innerText = "";
    endPointsContainer.innerText = "";
    return;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    displayNameEl.innerText = messages.welcome(decodedToken.email);

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
      throw new Error(messages.fetchProfileError);
    }

    const result = await response.json();

    if (result.isAdmin && Array.isArray(result.userData)) {
      let userTableHTML = `
        <table border="1">
          <thead>
            <tr>
              <th>Email</th>
              <th>Total Requests (GET + POST)</th>
              <th>API Calls Remaining</th>
            </tr>
          </thead>
          <tbody>
      `;

      result.userData.forEach((user) => {
        const totalRequests =
          (user.getRequests || 0) + (user.postRequests || 0);
        const apiCallsRemaining =
          user.apiUsage?.apiCallsRemaining ?? user.apiCallsRemaining ?? 0;

        userTableHTML += `
          <tr>
            <td>${user.email}</td>
            <td>${totalRequests}</td>
            <td>${apiCallsRemaining}</td>
          </tr>
        `;
      });

      userTableHTML += `</tbody></table>`;
      tableContainer.innerHTML = userTableHTML;

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
        endPointsContainer.innerHTML = `<p>${messages.noEndpointStats}</p>`;
      }
    } else {
      tableContainer.innerHTML = `
        <p>${messages.userDataLabel(JSON.stringify(result.userData))}</p>
      `;
      endPointsContainer.innerHTML = "";
    }
  } catch (error) {
    console.error(error);
    tableContainer.innerText = messages.loadDataError;
    endPointsContainer.innerText = messages.endpointStatsError;
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
