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

    await attemptLogin(username, password);
});

const signupForm = document.getElementById("form-signup");
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = signupForm.username.value;
    const password = signupForm.password.value;
    // TODO: input validation

    await attemptSignup(username, password);
    await attemptLogin(username, password);
});

async function attemptLogin(username, password) {
    try {
        const res = await fetch("https://127.0.0.1:443/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            // TODO: error message popup with data.error
            return;
        }

        const data = await res.json();

        console.log(data);

        sessionStorage.setItem("auth-token", data.token);
        const user = {
            username: data.username,
            uuid: data.uuid
        };

        console.log("User: ", user)
        sessionStorage.setItem("user", JSON.stringify(user));
        window.location.replace("./notes.html");
    } catch (err) {
        // TODO: error message popup with data.error
    }
}

async function attemptSignup(username, password) {
    try {
        const res = await fetch("https://127.0.0.1:443/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            // TODO: error message popup with data.error
        }
    } catch (err) {
        // TODO: error message popup with data.error
    }
}