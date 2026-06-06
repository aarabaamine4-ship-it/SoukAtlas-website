const USERS_KEY = "souk-atlas-demo-users";
const SESSION_KEY = "souk-atlas-current-user";

const page = document.body.dataset.authPage;
const alertBox = document.getElementById("authAlert");

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.hidden = false;
  alertBox.classList.toggle("success", type === "success");
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

if (page === "register") {
  document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = normalizeEmail(document.getElementById("emailInput").value);
    const password = document.getElementById("passwordInput").value;

    if (!name || !email || !password) {
      showAlert("Please fill in all fields.");
      return;
    }

    if (password.length < 4) {
      showAlert("Password must be at least 4 characters.");
      return;
    }

    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      showAlert("This email is already registered.");
      return;
    }

    users.push({ name, email, password });
    saveUsers(users);
    showAlert("Account created. Redirecting to login...", "success");

    window.setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
  });
}

if (page === "login") {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = normalizeEmail(document.getElementById("emailInput").value);
    const password = document.getElementById("passwordInput").value;
    const user = getUsers().find((item) => item.email === email && item.password === password);

    if (!user) {
      showAlert("Email or password is incorrect. Create an account first if you are new.");
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    showAlert("Logged in. Redirecting...", "success");

    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}
