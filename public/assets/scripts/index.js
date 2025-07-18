import { FailSchema, StringField } from "./fail.esm.js";
import { createToast } from "./toastUtils.js";

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
            createToast(data.error, "error-toast", 1500);
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
        createToast(err.message || "Server error", "error-toast", 1500);
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
            createToast(data.error, "error-toast", 1500);
            return;
        }

        await attemptLogin(username, password);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
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

    // Same schema as used in the API for a post to /api/users
    const userSchema = new FailSchema();
    userSchema.add("username", new StringField().required().minLength(8).maxLength(20).alphanumeric());
    userSchema.add("password", new StringField().required().minLength(8).maxLength(20).regex(/[!@#$%^&*(),.?":{}|<>_\-\\[\]=+;'/`~\/]/));

    // ruleMap corresponds to the list of <p> elements beneath the signup form and the validation rules they refer to
    const ruleMap = {
        "username-length": {
            elementId: "p-username-length",
            rules: [
                { field: "username", rule: "minLength" },
                { field: "username", rule: "maxLength" }
            ]
        },
        "password-length": {
            elementId: "p-password-length",
            rules: [
                { field: "password", rule: "minLength" },
                { field: "password", rule: "maxLength" }
            ]
        },
        "username-characters": {
            elementId: "p-username-characters",
            rules: [
                { field: "username", rule: "alphanumeric" }
            ]
        },
        "password-specialChar": {
            elementId: "p-password-characters",
            rules: [
                { field: "password", rule: "regex" }
            ]
        }
    };

    let success = true;

    // Callback to update each <p> element's class based on rule success
    const callback = (key, errors, meta) => {
        const el = document.getElementById(meta.elementId);
        if (!el) return;

        if (errors.length === 0) {
            el.classList.remove("invalid");
            el.classList.add("valid");
        } else {
            el.classList.remove("valid");
            el.classList.add("invalid");
            success = false;
        }
    };

    userSchema.validateAllWithCallback({ username, password}, callback, ruleMap);

    if (success)
        signupForm.submit.disabled = false;
    else
        signupForm.submit.disabled = true;
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