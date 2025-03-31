const API_URL = 'https://goldfish-app-cqju6.ondigitalocean.app/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const messageEl = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const token = localStorage.getItem('authToken');

    const payload = {};
    if (email) payload.email = email;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      messageEl.textContent = 'Please enter an email or password to update.';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = 'Profile updated successfully.';
        form.reset();
      } else {
        messageEl.textContent = result.message || 'Failed to update profile.';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      messageEl.textContent = 'An error occurred. Please try again.';
    }
  });

  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.location.href = 'user.html';
  });
});
