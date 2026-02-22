// ======================================================
// ===============   DATENBANK / LOCALSTORAGE   =========
// ======================================================

let users = JSON.parse(localStorage.getItem("users")) || [
    { username: "Admin", password: "1918", role: "admin", balance: 0 },
    { username: "Luca", password: "6626", role: "user", balance: 0 },
    { username: "Matthias", password: "3476", role: "user", balance: 0 },
    { username: "Ludwig", password: "6784", role: "user", balance: 0 },
    { username: "Tobias", password: "3945", role: "user", balance: 0 },
    { username: "Philipp", password: "2344", role: "user", balance: 0 },
    { username: "Lukas", password: "4655", role: "user", balance: 0 },
    { username: "Max", password: "9674", role: "user", balance: 0 }
];

let drinks = JSON.parse(localStorage.getItem("drinks")) || [
    { name: "Mischgetränke", price: 0.40 },
    { name: "Mische", price: 1.5 },
    { name: "Desperados", price: 2.0 },
    { name: "Spezi", price: 1.0 },
    { name: "Bier", price: 1.0 }
];

let cash = Number(localStorage.getItem("cash")) || 0;

localStorage.setItem("users", JSON.stringify(users));
localStorage.setItem("drinks", JSON.stringify(drinks));
localStorage.setItem("cash", cash);


// ======================================================
// ======================= LOGIN ========================
// ======================================================

if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", () => {
        const userName = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        const found = users.find(u => u.username === userName && u.password === pass);

        if (!found) {
            document.getElementById("message").textContent = "❌ Falsche Daten!";
            return;
        }

        localStorage.setItem("currentUser", found.username);

        if (found.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    });
}


// ======================================================
// ===================== USER-SEITE =====================
// ======================================================

if (document.getElementById("welcome")) {

    const currentUserName = localStorage.getItem("currentUser");
    const currentUser = users.find(u => u.username === currentUserName);

    const welcomeEl = document.getElementById("welcome");
    const balanceEl = document.getElementById("balance");
    const warningEl = document.getElementById("warning");
    const drinkListEl = document.getElementById("drinkList");
    const userDrinkListEl = document.getElementById("userDrinkList");

    welcomeEl.textContent = "Hallo " + currentUser.username;

    function updateUserUI() {
        balanceEl.textContent = "Kontostand: " + currentUser.balance.toFixed(2) + " €";

        warningEl.textContent =
            currentUser.balance >= 30 ? "⚠️ Du hast 30€ erreicht – bitte bezahlen!" : "";
    }

    updateUserUI();

    // Getränke buchen
    drinks.forEach(d => {
        const btn = document.createElement("button");
        btn.textContent = `${d.name} (${d.price} €)`;
        btn.className = "drink-button";
        btn.onclick = () => {
            currentUser.balance += d.price;
            saveAll();
            updateUserUI();
        };
        drinkListEl.appendChild(btn);
    });

    // Alle Benutzer + Getränke anzeigen
    users
    .filter(u => u.role !== "admin")
    .forEach(u => {
        const card = document.createElement("div");
        card.className = "user-card";

        card.innerHTML = `
            <strong>${u.username}</strong><br>
            Kontostand: ${u.balance.toFixed(2)} €<br>
        `;

        userDrinkListEl.appendChild(card);
    });

}


// ======================================================
// =================== ADMIN – DASHBOARD ================
// ======================================================

if (document.getElementById("statUsers")) {

    const statUsers = document.getElementById("statUsers");
    const statDebt = document.getElementById("statDebt");
    const statDrinks = document.getElementById("statDrinks");
    const statMax = document.getElementById("statMax");

    statUsers.innerHTML = `<h2>${users.length}</h2><p>Benutzer</p>`;

    const total = users.reduce((sum, u) => sum + u.balance, 0);
    statDebt.innerHTML = `<h2>${total.toFixed(2)} €</h2><p>Gesamtschulden</p>`;

    statDrinks.innerHTML = `<h2>${drinks.length}</h2><p>Getränke</p>`;

    const max = Math.max(...users.map(u => u.balance));
    statMax.innerHTML = `<h2>${max.toFixed(2)} €</h2><p>Höchster Kontostand</p>`;
}


// ======================================================
// ================= ADMIN – BENUTZER ===================
// ======================================================

if (document.getElementById("adminUserList")) {
    renderUsersAdmin();
}

function renderUsersAdmin() {
    const list = document.getElementById("adminUserList");
    list.innerHTML = "";

    users.forEach((u, i) => {
        list.innerHTML += `
            <div class="user-card">
                <input value="${u.username}" onchange="editUserName(${i}, this.value)">
                <input value="${u.password}" onchange="editUserPassword(${i}, this.value)">
                <select onchange="editUserRole(${i}, this.value)">
                    <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                    <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                </select>
                <button onclick="resetUserBalance(${i})">Reset €</button>
                <button onclick="deleteUser(${i})">Löschen</button>
            </div>
        `;
    });
}

function addUser() {
    const name = document.getElementById("newUserName").value.trim();
    const pass = document.getElementById("newUserPassword").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!name || !pass) return;

    users.push({ username: name, password: pass, role, balance: 0 });
    saveAll();
    renderUsersAdmin();
}

function editUserName(i, value) {
    users[i].username = value;
    saveAll();
}

function editUserPassword(i, value) {
    users[i].password = value;
    saveAll();
}

function editUserRole(i, value) {
    users[i].role = value;
    saveAll();
}

function resetUserBalance(i) {
    users[i].balance = 0;
    saveAll();
    renderUsersAdmin();
}

function deleteUser(i) {
    users.splice(i, 1);
    saveAll();
    renderUsersAdmin();
}


// ======================================================
// ================= ADMIN – GETRÄNKE ===================
// ======================================================

if (document.getElementById("drinkAdminList")) {
    renderDrinksAdmin();
}

function renderDrinksAdmin() {
    const list = document.getElementById("drinkAdminList");
    list.innerHTML = "";

    drinks.forEach((d, i) => {
        list.innerHTML += `
            <div class="user-card">
                <input value="${d.name}" onchange="editDrinkName(${i}, this.value)">
                <input value="${d.price}" onchange="editDrinkPrice(${i}, this.value)">
                <button onclick="deleteDrink(${i})">Löschen</button>
            </div>
        `;
    });
}

function addDrink() {
    const name = document.getElementById("newDrinkName").value.trim();
    const price = parseFloat(document.getElementById("newDrinkPrice").value);

    if (!name || isNaN(price)) return;

    drinks.push({ name, price });
    saveAll();
    renderDrinksAdmin();
}

function editDrinkName(i, value) {
    drinks[i].name = value;
    saveAll();
}

function editDrinkPrice(i, value) {
    drinks[i].price = parseFloat(value);
    saveAll();
}

function deleteDrink(i) {
    drinks.splice(i, 1);
    saveAll();
    renderDrinksAdmin();
}


// ======================================================
// ================= ADMIN – KASSE ======================
// ======================================================

if (document.getElementById("cashDisplay")) {
    document.getElementById("cashDisplay").textContent = cash.toFixed(2) + " €";
}

function editCash() {
    const newAmount = Number(prompt("Neuer Kassenstand:", cash));
    if (!isNaN(newAmount)) {
        cash = newAmount;
        saveAll();
        document.getElementById("cashDisplay").textContent = cash.toFixed(2) + " €";
    }
}

function resetAllBalances() {
    if (!confirm("Wirklich ALLE Schulden zurücksetzen?")) return;

    users.forEach(u => u.balance = 0);
    saveAll();
    alert("Alle Schulden wurden zurückgesetzt.");
}


// ======================================================
// ===================== SPEICHERN ======================
// ======================================================

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("drinks", JSON.stringify(drinks));
    localStorage.setItem("cash", cash);
}
