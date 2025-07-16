document.getElementById("a-logout").addEventListener("click", logout);

const { authToken, user } = loadData();

document.getElementById("btn-menu").textContent = `\u{1F464}${user.username}`;

function loadData() {
    try {
        let authToken = sessionStorage.getItem("auth-token");
        let user = JSON.parse(sessionStorage.getItem("user"));

        if (!authToken || !user || !user.username || !user.uuid)
            logout();

        return { authToken, user };
    } catch (e) {
        logout();
    }
}

function logout() {
    sessionStorage.clear();
    window.location.replace("./index.html");
}

async function getNotes() {

}