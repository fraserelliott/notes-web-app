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
loginForm.username.addEventListener("input", validateLoginForm);
loginForm.password.addEventListener("input", validateLoginForm);
loginForm.username.addEventListener("blur", validateLoginForm);
loginForm.password.addEventListener("blur", validateLoginForm);
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    // TODO: input validation

    await attemptLogin(username, password);
});

const signupForm = document.getElementById("form-signup");
signupForm.username.addEventListener("input", validateSignupForm);
signupForm.password.addEventListener("input", validateSignupForm);
signupForm.username.addEventListener("blur", validateSignupForm);
signupForm.password.addEventListener("blur", validateSignupForm);
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = signupForm.username.value;
    const password = signupForm.password.value;
    // TODO: input validation

    await attemptSignup(username, password);
});

async function attemptLogin(username, password) {
    try {
        const res = await fetch("/api/auth", {
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
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            // TODO: error message popup with data.error
            return;
        }

        await attemptLogin(username, password);
    } catch (err) {
        // TODO: error message popup with data.error
    }
}

function validateLoginForm() {
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    // Update form based on whether username and password are empty
    updateInputClass(loginForm.username, username);
    updateInputClass(loginForm.password, password);

    if (!username || !password)
        loginForm.submit.disabled = true;
    else
        loginForm.submit.disabled = false;
}

function validateSignupForm() {
    const username = signupForm.username.value;
    const password = signupForm.password.value;

    // Update form based on whether username and password are empty
    updateInputClass(signupForm.username, username);
    updateInputClass(signupForm.password, password);

    if (!username || !password)
        signupForm.submit.disabled = true;
    else
        signupForm.submit.disabled = false;
}

function updateInputClass(inputEl, validated) {
    if (validated) {
        inputEl.classList.add("valid");
        inputEl.classList.remove("invalid");
    } else {
        inputEl.classList.remove("valid");
        inputEl.classList.add("invalid");
    }
}