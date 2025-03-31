import { messages } from "../messages.js";

const API_URL = "https://goldfish-app-cqju6.ondigitalocean.app/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileForm");
  const messageEl = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const token = localStorage.getItem("authToken");

    const payload = {};
    if (email) payload.email = email;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      messageEl.textContent = messages.updateEmptyFields;
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = messages.updateSuccess;
        form.reset();
      } else {
        messageEl.textContent = result.message || messages.updateFail;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      messageEl.textContent = messages.updateError;
    }
  });

  document.getElementById("goBackBtn").addEventListener("click", () => {
    window.location.href = "user.html";
  });
});
