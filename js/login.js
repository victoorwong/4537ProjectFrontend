import { messages } from "../messages.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "https://goldfish-app-cqju6.ondigitalocean.app/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(messages.loginSuccess);

      if (!data.token) {
        alert(messages.noToken);
        return;
      }

      localStorage.setItem("authToken", data.token);

      try {
        const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
        localStorage.setItem("isAdmin", decodedToken.isAdmin);

        if (decodedToken.isAdmin) {
          window.location.href = "admin.html";
        } else {
          window.location.href = "user.html";
        }
      } catch (decodeError) {
        console.error(decodeError);
        alert(messages.decodeError);
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert(messages.loginError);
  }
});
