const noteModalStates = {
    ADDNOTE: 0,
    EDITNOTE: 1
};
let noteModalState;
let editingNote;
const { authToken, user } = loadSessionData();

document.getElementById("a-logout").addEventListener("click", logout);
document.getElementById("btn-menu").textContent = `\u{1F464}${user.username}`;
document.getElementById("btn-new-note").addEventListener("click", showNewNoteModal);
document.getElementById("btn-save-note").addEventListener("click", saveNoteModal);

const modalEl = document.getElementById("modal-note");
const modal = new bootstrap.Modal(modalEl);

const titleInput = document.getElementById("textarea-note-title");
titleInput.addEventListener("input", () => {
    titleInput.style.height = "auto";
    titleInput.style.height = titleInput.scrollHeight + "px";
    // TODO: trim to max length
});

getNotes(); // Run this on page load to populate page, it has an automated logout for malformed/missing sessionStorage data

function loadSessionData() {
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
    try {
        const res = await fetch("/api/notes", {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const data = await res.json();

        data.forEach(note => {
            addNote(note, false);
        });
    } catch (err) {
        // TODO: error message popup with data.error
    }
}

function addNote(note, addToTop) {
    const editBtnId = `btnEdit${note.id}`;
    const deleteBtnId = `btnDelete${note.id}`;
    const collapseId = `collapse${note.id}`;
    const titleId = `title${note.id}`;
    const contentId = `content${note.id}`;
    const accordionId = `accordion${note.id}`;
    const timestampId = `timestamp${note.id}`;

    const createdAtString = formatTime(note.created_at);
    const updatedAtString = note.updated_at ? ` (edited at ${formatTime(note.updated_at)})` : "";

    //Bootstrap accordion using ids defined above to change content later if required and to add listeners to buttons
    const divEl = document.createElement("div");
    divEl.id = accordionId;
    divEl.className = "accordion";
    divEl.innerHTML = `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <div class="d-flex align-items-center justify-content-between w-100">
                    <button id=${titleId} class="accordion-button flex-grow-1 text-start collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}">
                        ${note.title}
                    </button>
                    <div class="ms-2 flex-shrink-0">
                        <button class="btn btn-sm btn-outline-primary me-1" id="${editBtnId}" title="Edit">✏️</button>
                        <button class="btn btn-sm btn-outline-danger me-1" id="${deleteBtnId}" title="Delete">🗑️</button>
                    </div>
                </div>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                <div class="accordion-body">
                    <p id="${contentId}">${note.content}</p>
                    <small id="${timestampId}" class="text-muted">${createdAtString}${updatedAtString}</small>
                </div>
            </div>
        </div>
    `;

    //add Listeners to buttons created in the innerHTML
    divEl.querySelector(`#${editBtnId}`).addEventListener("click", () => handleEdit(note));
    divEl.querySelector(`#${deleteBtnId}`).addEventListener("click", () => handleDelete(note));

    if (addToTop)
        document.getElementById("main-notes").prepend(divEl);
    else
        document.getElementById("main-notes").appendChild(divEl);
}

function formatTime(utcDateString) {
    const date = new Date(utcDateString);

    // Get day, short month, year
    const datePart = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date).replace(/ /g, "-"); // e.g. "17-Jul-2025"

    // Get hour:minute and am/pm
    const timePart = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date); // e.g. "2:53 AM"

    return `${datePart} ${timePart}`;
}

function handleEdit(note) {
    // set variables used in the editNoteFromModal function
    editingNote = note;
    noteModalState = noteModalStates.EDITNOTE;
    document.getElementById("textarea-note-title").value = note.title;
    document.getElementById("textarea-note-content").value = note.content;
    modal.show();
}

async function handleDelete(note) {
    // Confirm and delete the note
    try {
        const res = await fetch(`/api/notes/${note.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${authToken}` },
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error deleting note: ", data.error);
            // TODO: error message popup with data.error
            return;
        }

        // TODO: success popup

        document.getElementById(`accordion${note.id}`).remove();
    } catch (err) {
        // TODO: error message popup with data.error
        console.error(err.message);
    }
}

function showNewNoteModal() {
    // Reset values for title and content textareas. Set variable used in saveNoteModal function called by the modal's save button
    document.getElementById("textarea-note-title").value = "";
    document.getElementById("textarea-note-content").value = "";
    noteModalState = noteModalStates.ADDNOTE;
    modal.show();
}

function saveNoteModal() {
    switch (noteModalState) {
        case noteModalStates.ADDNOTE:
            addNoteFromModal();
            break;
        case noteModalStates.EDITNOTE:
            editNoteFromModal();
            break;
    }
}

async function addNoteFromModal() {
    try {
        const title = document.getElementById("textarea-note-title").value.trim();
        const content = document.getElementById("textarea-note-content").value.trim();
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });
        const data = await res.json();

        if (!res.ok) {
            console.error("Error creating note: ", data.error);
            // TODO: error message popup with data.error
            return;
        }

        addNote(data.note, true);
        modal.hide();
    } catch (err) {
        // TODO: error message popup with data.error
        console.error(err.message);
    }
}

async function editNoteFromModal() {
    try {
        const title = document.getElementById("textarea-note-title").value.trim();
        const content = document.getElementById("textarea-note-content").value.trim();
        const res = await fetch(`/api/notes/${editingNote.id}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error creating note: ", data.error);
            // TODO: error message popup with data.error
            return;
        }

        // Remove accordion and prepend a new note
        const note = data.note;
        document.getElementById(`accordion${note.id}`).remove();
        addNote(note, true);

        modal.hide();
    } catch (err) {
        // TODO: error message popup with data.error
        console.error(err.message);
    }
}