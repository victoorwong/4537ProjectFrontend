// Function to display the user's email, should be put into a class
function displayUserEmail() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    document.getElementById("displayName").innerText = "Not logged in";
    return;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    document.getElementById(
      "displayName"
    ).innerText = `Welcome, ${decodedToken.email}`;
  } catch (error) {
    console.error("Error decoding token:", error);
    document.getElementById("displayName").innerText = "Error displaying user";
  }
}

displayUserEmail();

document.getElementById("logOut").addEventListener("click", async () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");

    await fetch("https://goldfish-app-cqju6.ondigitalocean.app/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout Error:", error);
    alert("Error logging out. Please try again.");
  }
});

document.getElementById("toUserPage").addEventListener("click", () => {
  window.location.href = "user.html";
});
