import { createToast } from "./toastUtils.js"; 

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
document.getElementById("btn-confirm-delete-user").addEventListener("click", deleteUser);

const noteModalEl = document.getElementById("modal-note");
const noteModal = new bootstrap.Modal(noteModalEl);

const deleteModalEl = document.getElementById("modal-delete-user");
const deleteModal = new bootstrap.Modal(deleteModalEl);
document.getElementById("a-delete").addEventListener("click", () => {
    deleteModal.show();
});

const titleInput = document.getElementById("textarea-note-title");
titleInput.addEventListener("input", () => {
    titleInput.style.height = "auto";
    titleInput.style.height = titleInput.scrollHeight + "px";
});

getNotes(); // Run this on page load to populate page, it has an automated logout for malformed/missing sessionStorage data

// Load auth token and user info from sessionStorage or force log out if invalid
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

// Send request to delete user account, then log out on success
async function deleteUser() {
    console.log("Deleting user with token: ", authToken);
    try {
        const res = await fetch("/api/users", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${authToken}` },
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast(data.error || "Error deleting user", "error-toast", 1500);
            console.error("Error deleting user: ", data.error);
            return;
        }

        logout();
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Fetch and display all notes for the current user on page load
async function getNotes() {
    try {
        const res = await fetch("/api/notes", {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (!res.ok) {
            checkAuthFail(res);
            createToast(data.error || "Error getting notes", "error-toast", 1500);
            console.error("Error getting notes: ", data.error);
            return;
        }

        const data = await res.json();

        data.forEach(note => {
            addNoteToDOM(note, false);
        });
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Create and insert a Bootstrap accordion component with edit/delete buttons for the given note.
function addNoteToDOM(note, addToTop) {
    // Generate unique IDs corresponding to the note's ID which is unique in the database
    const editBtnId = `btnEdit${note.id}`;
    const deleteBtnId = `btnDelete${note.id}`;
    const collapseId = `collapse${note.id}`;
    const titleId = `title${note.id}`;
    const contentId = `content${note.id}`;
    const accordionId = `accordion${note.id}`;
    const timestampId = `timestamp${note.id}`;

    const createdAtString = formatTime(note.created_at);
    const updatedAtString = note.updated_at ? ` (edited at ${formatTime(note.updated_at)})` : "";

    // Create a Bootstrap accordion component using these IDs and data from the note
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

    // Attach event listeners to the edit and delete buttons
    divEl.querySelector(`#${editBtnId}`).addEventListener("click", () => handleEdit(note));
    divEl.querySelector(`#${deleteBtnId}`).addEventListener("click", () => handleDelete(note));

    if (addToTop)
        document.getElementById("main-notes").prepend(divEl);
    else
        document.getElementById("main-notes").appendChild(divEl);
}

// Format a UTC timestamp to a readable string (e.g. 17-Jul-2025 2:53 AM)
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

// Load existing note content into modal for editing
function handleEdit(note) {
    // set variables used in the editNoteFromModal function
    editingNote = note;
    noteModalState = noteModalStates.EDITNOTE;
    document.getElementById("textarea-note-title").value = note.title;
    document.getElementById("textarea-note-content").value = note.content;
    noteModal.show();
}

// Delete a note via API and remove it from the DOM
async function handleDelete(note) {
    try {
        const res = await fetch(`/api/notes/${note.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${authToken}` },
        });

        const data = await res.json();

        if (!res.ok) {
            checkAuthFail(res);
            createToast(data.error || "Error deleting note", "error-toast", 1500);
            console.error("Error deleting note: ", data.error);
            return;
        }

        document.getElementById(`accordion${note.id}`).remove();
        createToast("Successfully deleted note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Prepare modal for adding a new note
function showNewNoteModal() {
    // Reset values for title and content textareas. Set variable used in saveNoteModal function called by the modal's save button
    document.getElementById("textarea-note-title").value = "";
    document.getElementById("textarea-note-content").value = "";
    noteModalState = noteModalStates.ADDNOTE;
    noteModal.show();
}

// Handle modal save button event, noteModalState is set when opening it
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

// Send new note data to API and add to top of notes list
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
            checkAuthFail(res);
            createToast(data.error || "Error creating note", "error-toast", 1500);
            console.error("Error creating note: ", data.error);
            return;
        }

        addNoteToDOM(data.note, true);
        noteModal.hide();
        createToast("Successfully created note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Send updated note data to API and refresh note in DOM
async function editNoteFromModal() {
    try {
        const title = document.getElementById("textarea-note-title").value.trim();
        const content = document.getElementById("textarea-note-content").value.trim();
        const res = await fetch(`/api/notes/${editingNote.id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });

        const data = await res.json();

        if (!res.ok) {
            checkAuthFail(res);
            createToast(data.error || "Error editing note", "error-toast", 1500);
            console.error("Error editing note: ", data.error);
            return;
        }

        // Remove accordion and prepend a new note
        const note = data.note;
        document.getElementById(`accordion${note.id}`).remove();
        addNoteToDOM(note, true);

        noteModal.hide();
        createToast("Successfully saved note", "success-toast", 1500);
    } catch (err) {
        createToast(err.message || "Server error", "error-toast", 1500);
    }
}

// Force logout on API authorisation error
function checkAuthFail(res) {
    if (res.status == 401)
        logout();
}