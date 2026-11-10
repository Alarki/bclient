let currentContactId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});

// --- VIEW SWITCHING ---
function showCreateForm() {
    currentContactId = null;
    document.getElementById("form-title").innerText = "New Contact";
    document.getElementById("contact-form").reset();
    document.getElementById("alert-box").style.display = "none";
    
    // Reset form inputs just in case they were disabled from a previous edit
    document.getElementById("contact-name").readOnly = false;
    document.getElementById("contact-surname").readOnly = false;
    document.getElementById("contact-email").readOnly = false;
    document.querySelector("#contact-form button[type='submit']").classList.remove("hidden");

    document.getElementById("clients-tab-placeholder").classList.remove("hidden");
    document.getElementById("clients-tab-content").classList.add("hidden");
    
    switchTab('general');
    
    document.getElementById("list-view").classList.add("hidden");
    document.getElementById("form-view").classList.remove("hidden");
}

function showListView() {
    document.getElementById("list-view").classList.remove("hidden");
    document.getElementById("form-view").classList.add("hidden");
    loadContacts();
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

// --- EDIT/VIEW EXISTING CONTACT ---
function editContact(id, name, surname, email) {
    currentContactId = id;
    
    document.getElementById("form-title").innerText = `${name} ${surname}`;
    document.getElementById("contact-name").value = name;
    document.getElementById("contact-surname").value = surname;
    document.getElementById("contact-email").value = email;
    
    document.getElementById("contact-name").readOnly = true;
    document.getElementById("contact-surname").readOnly = true;
    document.getElementById("contact-email").readOnly = true;
    document.querySelector("#contact-form button[type='submit']").classList.add("hidden");
    
    document.getElementById("clients-tab-placeholder").classList.add("hidden");
    document.getElementById("clients-tab-content").classList.remove("hidden");
    
    document.getElementById("alert-box").style.display = "none";
    switchTab('general');
    
    document.getElementById("list-view").classList.add("hidden");
    document.getElementById("form-view").classList.remove("hidden");
    
    loadLinkedClients();
}

// --- AJAX CALLS ---

async function loadContacts() {
    const container = document.getElementById("contact-list-container");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch("/api/contacts/");
        const contacts = await response.json();

        if (contacts.length === 0) {
            container.innerHTML = `<div class="empty-state">No contact(s) found.</div>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Email address</th>
                        <th class="text-center">No. of linked clients</th>
                    </tr>
                </thead>
                <tbody>
        `;

        contacts.forEach(contact => {
            html += `
                <tr>
                    <td style="cursor: pointer; color: var(--primary); font-weight: 500;" onclick="editContact(${contact.id}, '${contact.name.replace(/'/g, "\\'")}', '${contact.surname.replace(/'/g, "\\'")}', '${contact.email}')">
                        ${contact.name}
                    </td>
                    <td>${contact.surname}</td>
                    <td>${contact.email}</td>
                    <td class="text-center">${contact.client_count}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<div class="alert alert-error">Error loading contacts.</div>`;
        console.error(error);
    }
}

async function saveContact(event) {
    event.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const surname = document.getElementById("contact-surname").value.trim();
    const email = document.getElementById("contact-email").value.trim();

    if (!name || !surname || !email) {
        showAlert("Name, surname, and email are required.", "error");
        return;
    }
    if (!email.includes("@")) {
        showAlert("Please enter a valid email address.", "error");
        return;
    }

    try {
        const response = await fetch("/api/contacts/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name, surname: surname, email: email })
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMsg = "Failed to create contact.";
            if (data.detail && Array.isArray(data.detail)) {
                errorMsg = data.detail[0].msg;
            } else if (data.detail) {
                errorMsg = data.detail;
            }
            showAlert(errorMsg, "error");
            return;
        }

        showAlert("Contact saved successfully!", "success");
        
        document.getElementById("contact-name").readOnly = true;
        document.getElementById("contact-surname").readOnly = true;
        document.getElementById("contact-email").readOnly = true;
        document.querySelector("#contact-form button[type='submit']").classList.add("hidden");

        document.getElementById("clients-tab-placeholder").classList.add("hidden");
        document.getElementById("clients-tab-content").classList.remove("hidden");
        
        currentContactId = data.id;
        loadLinkedClients();

    } catch (error) {
        showAlert("An error occurred. Please try again.", "error");
        console.error(error);
    }
}

// --- LINKING LOGIC ---

async function loadLinkedClients() {
    if (!currentContactId) return;

    const container = document.getElementById("linked-clients-list");
    container.innerHTML = "<p>Loading linked clients...</p>";

    try {
        const linkedRes = await fetch(`/api/contacts/${currentContactId}/clients`);
        const linkedClients = await linkedRes.json();

        const allRes = await fetch("/api/clients/");
        const allClients = await allRes.json();

        const select = document.getElementById("link-client-select");
        select.innerHTML = '<option value="">-- Select a client --</option>';
        allClients.forEach(client => {
            const isLinked = linkedClients.some(c => c.id === client.id);
            if (!isLinked) {
                select.innerHTML += `<option value="${client.id}">${client.name} (${client.client_code})</option>`;
            }
        });

        if (linkedClients.length === 0) {
            container.innerHTML = `<div class="empty-state">No contact(s) found.</div>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Client Name</th>
                        <th>Client Code</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;

        linkedClients.forEach(client => {
            html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.client_code}</td>
                    <td>
                        <a href="#" onclick="unlinkClient(${client.id}); return false;" style="color: var(--danger); text-decoration: none;">Unlink</a>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-error">Error loading linked clients.</div>`;
    }
}

async function linkClient() {
    const select = document.getElementById("link-client-select");
    const clientId = select.value;
    
    if (!clientId) {
        showAlert("Please select a client to link.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/clients/${clientId}/contacts/${currentContactId}`, {
            method: "POST"
        });

        if (!response.ok) {
            const data = await response.json();
            showAlert(data.detail || "Failed to link client.", "error");
            return;
        }

        document.getElementById("alert-box").style.display = "none";
        loadLinkedClients();

    } catch (error) {
        console.error(error);
    }
}

async function unlinkClient(clientId) {
    if (!confirm("Are you sure you want to unlink this client?")) {
        return;
    }

    try {
        const response = await fetch(`/api/clients/${clientId}/contacts/${currentContactId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            showAlert("Failed to unlink client.", "error");
            return;
        }

        loadLinkedClients();

    } catch (error) {
        console.error(error);
    }
}