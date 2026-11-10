// Keep track of the current view state
let currentClientId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadClients();
});

// --- VIEW SWITCHING ---
function showCreateForm() {
    currentClientId = null;
    document.getElementById("form-title").innerText = "New Client";
    document.getElementById("client-form").reset();
    document.getElementById("client-code").value = ""; 
    document.getElementById("alert-box").style.display = "none";
    document.getElementById("contacts-tab-placeholder").classList.remove("hidden");
    document.getElementById("contacts-tab-content").classList.add("hidden");
    
    // Reset form inputs just in case they were disabled from a previous edit
    document.getElementById("client-name").readOnly = false;
    document.querySelector("#client-form button[type='submit']").classList.remove("hidden");
    
    switchTab('general');
    
    document.getElementById("list-view").classList.add("hidden");
    document.getElementById("form-view").classList.remove("hidden");
}

function showListView() {
    document.getElementById("list-view").classList.remove("hidden");
    document.getElementById("form-view").classList.add("hidden");
    loadClients();
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
    
    document.getElementById(`tab-${tabName}`).classList.add("active");
    
    if (tabName === 'general') {
        document.querySelectorAll(".tab")[0].classList.add("active");
    } else {
        document.querySelectorAll(".tab")[1].classList.add("active");
    }
}

function showAlert(message, type) {
    const box = document.getElementById("alert-box");
    box.innerText = message;
    box.className = `alert alert-${type}`;
    box.style.display = "block";
}

// --- EDIT/VIEW EXISTING CLIENT ---
function editClient(id, name, code) {
    currentClientId = id;
    
    document.getElementById("form-title").innerText = name;
    document.getElementById("client-name").value = name;
    document.getElementById("client-name").readOnly = true;
    document.getElementById("client-code").value = code;
    
    document.querySelector("#client-form button[type='submit']").classList.add("hidden");
    
    document.getElementById("contacts-tab-placeholder").classList.add("hidden");
    document.getElementById("contacts-tab-content").classList.remove("hidden");
    
    document.getElementById("alert-box").style.display = "none";
    switchTab('general');
    
    document.getElementById("list-view").classList.add("hidden");
    document.getElementById("form-view").classList.remove("hidden");
    
    loadLinkedContacts();
}

// --- AJAX CALLS ---

async function loadClients() {
    const container = document.getElementById("client-list-container");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch("/api/clients/");
        const clients = await response.json();

        if (clients.length === 0) {
            container.innerHTML = `<div class="empty-state">No client(s) found.</div>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Client Code</th>
                        <th class="text-center">No. of linked contacts</th>
                    </tr>
                </thead>
                <tbody>
        `;

        clients.forEach(client => {
            html += `
                <tr>
                    <td style="cursor: pointer; color: var(--primary); font-weight: 500;" onclick="editClient(${client.id}, '${client.name.replace(/'/g, "\\'")}', '${client.client_code}')">
                        ${client.name}
                    </td>
                    <td>${client.client_code}</td>
                    <td class="text-center">${client.contact_count}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">Error loading clients.</div>`;
        console.error(error);
    }
}

async function saveClient(event) {
    event.preventDefault();

    const nameInput = document.getElementById("client-name");
    const name = nameInput.value.trim();

    if (!name) {
        showAlert("Client name is required.", "error");
        return;
    }

    try {
        const response = await fetch("/api/clients/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.detail || "Failed to create client.", "error");
            return;
        }

        showAlert("Client saved successfully!", "success");
        document.getElementById("client-code").value = data.client_code;
        
        nameInput.readOnly = true;
        document.querySelector("#client-form button[type='submit']").classList.add("hidden");
        
        currentClientId = data.id;

        document.getElementById("contacts-tab-placeholder").classList.add("hidden");
        document.getElementById("contacts-tab-content").classList.remove("hidden");
        loadLinkedContacts();

    } catch (error) {
        showAlert("An error occurred. Please try again.", "error");
        console.error(error);
    }
}

// --- LINKING LOGIC ---

async function loadLinkedContacts() {
    if (!currentClientId) return;

    const container = document.getElementById("linked-contacts-list");
    container.innerHTML = "<p>Loading linked contacts...</p>";

    try {
        const linkedRes = await fetch(`/api/clients/${currentClientId}/contacts`);
        const linkedContacts = await linkedRes.json();

        const allRes = await fetch("/api/contacts/");
        const allContacts = await allRes.json();

        const select = document.getElementById("link-contact-select");
        select.innerHTML = '<option value="">-- Select a contact --</option>';
        allContacts.forEach(contact => {
            const isLinked = linkedContacts.some(c => c.id === contact.id);
            if (!isLinked) {
                select.innerHTML += `<option value="${contact.id}">${contact.surname} ${contact.name} (${contact.email})</option>`;
            }
        });

        if (linkedContacts.length === 0) {
            container.innerHTML = `<div class="empty-state">No contacts found.</div>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Contact Full Name</th>
                        <th>Email Address</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;

        linkedContacts.forEach(contact => {
            html += `
                <tr>
                    <td>${contact.surname} ${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>
                        <a href="#" onclick="unlinkContact(${contact.id}); return false;" style="color: var(--danger); text-decoration: none;">Unlink</a>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-error">Error loading linked contacts.</div>`;
    }
}

async function linkContact() {
    const select = document.getElementById("link-contact-select");
    const contactId = select.value;
    
    if (!contactId) {
        showAlert("Please select a contact to link.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/clients/${currentClientId}/contacts/${contactId}`, {
            method: "POST"
        });

        if (!response.ok) {
            const data = await response.json();
            showAlert(data.detail || "Failed to link contact.", "error");
            return;
        }

        document.getElementById("alert-box").style.display = "none";
        loadLinkedContacts();

    } catch (error) {
        console.error(error);
    }
}

async function unlinkContact(contactId) {
    if (!confirm("Are you sure you want to unlink this contact?")) {
        return;
    }

    try {
        const response = await fetch(`/api/clients/${currentClientId}/contacts/${contactId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            showAlert("Failed to unlink contact.", "error");
            return;
        }

        loadLinkedContacts();

    } catch (error) {
        console.error(error);
    }
}