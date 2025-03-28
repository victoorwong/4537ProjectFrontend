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
      alert("Login successful!");

      if (!data.token) {
        alert("No token received. Something went wrong.");
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
        console.error("Error decoding JWT:", decodeError);
        alert("Error processing authentication. Please try again.");
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("An error occurred. Please try again.");
  }
});
