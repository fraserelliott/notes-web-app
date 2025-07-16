document.getElementById("a-logout").addEventListener("click", logout);

const { authToken, user } = loadData();

function loadData() {
    try {
        let authToken = sessionStorage.getItem("auth-token");
        let user = JSON.parse(sessionStorage.getItem("user"));

        if (!token || !user || !user.username || !user.uuid)
            logout();

        return { authToken, user };
    } catch (e) {
        logout();
    }
}

document.getElementById("btn-menu").textContent = `\u{1F464}${sessionStorage.getItem("user")}`;

function logout() {
    sessionStorage.clear();
    window.location.replace("./index.html");
}

async function getNotes() {

}