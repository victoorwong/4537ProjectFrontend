function checkAccess(isAdminPage = false) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));

    if (isAdminPage && !decodedToken.isAdmin) {
      window.location.href = "user.html";
    }
  } catch (error) {
    console.error("Token verification error:", error);
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
  }
}
