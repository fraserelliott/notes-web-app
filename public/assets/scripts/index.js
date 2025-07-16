// Check for valid token to redirect on page load
if (sessionStorage.getItem("auth-token")) {
    window.location.replace("./notes.html");
}

document.getElementById("btn-show-signup").addEventListener("click", toggleForms);
document.getElementById("btn-show-login").addEventListener("click", toggleForms);

function toggleForms() {
    document.getElementById("section-login").classList.toggle("d-none");
    document.getElementById("section-signup").classList.toggle("d-none");
}

const loginForm = document.getElementById("form-login");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    // TODO: input validation

    try {
        const data = await attemptLogin(username, password);
        sessionStorage.setItem("auth-token", data.token);
        sessionStorage.setItem("username", username)
        window.location.replace("./notes.html");
    } catch (err) {
        console.error(err.message);
        // TODO: error message popup
    }
});

const signupForm = document.getElementById("form-signup");
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = signupForm.username.value;
    const password = signupForm.password.value;

    // TODO: input validation

    try {
        await attemptSignup(username, password);
        const data = await attemptLogin(username, password);
        sessionStorage.setItem("auth-token", data.token);
        user = {
            username: data.username,
            uuid: data.uuid
        };
        sessionStorage.setItem("user", JSON.stringify(user));
        window.location.replace("./notes.html");
    } catch (err) {
        console.error(err.message);
        // TODO: error message popup
    }
});

async function attemptLogin(username, password) {
    const res = await fetch("https://127.0.0.1:443/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Login failed.");
        // TODO: error message popup
    }

    return data;
}

async function attemptSignup(username, password) {
    const res = await fetch("https://127.0.0.1:443/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || "Login failed.");
        // TODO: error message popup
    }
}