// ================== BASIS-DATEN ==================

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
    { name: "Cola", price: 2 },
    { name: "Wasser", price: 1 },
    { name: "Eistee", price: 1.5 }
];

localStorage.setItem("users", JSON.stringify(users));
localStorage.setItem("drinks", JSON.stringify(drinks));


// ================== LOGIN-SEITE (index.html) ==================

if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", () => {
        const userName = document.getElementById("username").value;
        const pass = document.getElementById("password").value;

        const found = users.find(u => u.username === userName && u.password === pass);

        if (!found) {
            document.getElementById("message").textContent = "Falsche Daten!";
            return;
        }

        localStorage.setItem("currentUser", found.username);

        if (found.role === "admin") {
            window.location.href = "admin_dashboard.html";
        } else {
            window.location.href = "user.html";
        }
    });
}


// ================== USER-SEITE (user.html) ==================

if (document.getElementById("drinkList")) {
    const currentUserName = localStorage.getItem("currentUser");
    const currentUser = users.find(u => u.username === currentUserName);

    const welcomeEl = document.getElementById("welcome");
    const balanceEl = document.getElementById("balance");
    const warningEl = document.getElementById("warning");
    const drinkListEl = document.getElementById("drinkList");

    if (currentUser && welcomeEl) {
        welcomeEl.textContent = "Hallo " + currentUser.username;
    }

    function updateUserUI() {
        if (!currentUser) return;
        if (balanceEl) {
            balanceEl.textContent = "Kontostand: " + currentUser.balance.toFixed(2) + " €";
        }
        if (warningEl) {
            warningEl.textContent =
                currentUser.balance >= 30 ? "⚠️ Du hast 30€ erreicht - bitte bezahlen!" : "";
        }
    }

    updateUserUI();

    drinks.forEach(d => {
        const btn = document.createElement("button");
        btn.textContent = `${d.name} (${d.price} €)`;
        btn.className = "drink-button";
        btn.onclick = () => {
            currentUser.balance += d.price;
            localStorage.setItem("users", JSON.stringify(users));
            updateUserUI();
        };
        drinkListEl.appendChild(btn);
    });
}


// ================== GETRÄNKE-ADMIN (getraenke_admin.html) ==================

function renderDrinksAdmin() {
    const list = document.getElementById("drinkAdminList");
    if (!list) return;

    list.innerHTML = "";
    drinks.forEach((d, i) => {
        list.innerHTML += `
            <div class="card">
                <input value="${d.name}" onchange="editDrinkName(${i}, this.value)">
                <input value="${d.price}" onchange="editDrinkPrice(${i}, this.value)">
                <button onclick="deleteDrink(${i})">Löschen</button>
            </div>
        `;
    });
}

if (document.getElementById("drinkAdminList")) {
    renderDrinksAdmin();
}

function addDrink() {
    const nameEl = document.getElementById("newDrinkName");
    const priceEl = document.getElementById("newDrinkPrice");
    if (!nameEl || !priceEl) return;

    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);

    if (!name || isNaN(price)) return;

    drinks.push({ name, price });
    localStorage.setItem("drinks", JSON.stringify(drinks));
    nameEl.value = "";
    priceEl.value = "";
    renderDrinksAdmin();
}

function editDrinkName(i, value) {
    drinks[i].name = value;
    localStorage.setItem("drinks", JSON.stringify(drinks));
}

function editDrinkPrice(i, value) {
    drinks[i].price = parseFloat(value);
    localStorage.setItem("drinks", JSON.stringify(drinks));
}

function deleteDrink(i) {
    drinks.splice(i, 1);
    localStorage.setItem("drinks", JSON.stringify(drinks));
    renderDrinksAdmin();
}


// ================== ADMIN-DASHBOARD (admin_dashboard.html) ==================

if (document.getElementById("userCount")) {
    const userCountEl = document.getElementById("userCount");
    const totalDebtEl = document.getElementById("totalDebt");
    const drinkCountEl = document.getElementById("drinkCount");
    const maxDebtEl = document.getElementById("maxDebt");

    if (userCountEl) {
        userCountEl.innerHTML = `<h2>${users.length}</h2><p>Registrierte Benutzer</p>`;
    }

    const total = users.reduce((sum, u) => sum + u.balance, 0);
    if (totalDebtEl) {
        totalDebtEl.innerHTML = `<h2>${total.toFixed(2)} €</h2><p>Gesamtschulden</p>`;
    }

    if (drinkCountEl) {
        drinkCountEl.innerHTML = `<h2>${drinks.length}</h2><p>Getränke verfügbar</p>`;
    }

    const max = users.length ? Math.max(...users.map(u => u.balance)) : 0;
    if (maxDebtEl) {
        maxDebtEl.innerHTML = `<h2>${max.toFixed(2)} €</h2><p>Höchster Kontostand</p>`;
    }
}

function resetSystem() {
    if (confirm("Willst du wirklich ALLES zurücksetzen?")) {
        localStorage.clear();
        location.reload();
    }
}


// ================== BENUTZER-VERWALTUNG (admin_users.html) ==================

function renderUsersAdmin() {
    const list = document.getElementById("userList");
    if (!list) return;

    list.innerHTML = "";

    users.forEach((u, i) => {
        list.innerHTML += `
            <div class="user-card">
                <div>
                    <input value="${u.username}" onchange="editUserName(${i}, this.value)">
                    <input value="${u.password}" onchange="editUserPassword(${i}, this.value)">
                </div>
                <div>
                    <select onchange="editUserRole(${i}, this.value)">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                </div>
                <div>
                    <button onclick="resetUserBalance(${i})">Reset €</button>
                    <button onclick="deleteUser(${i})">Löschen</button>
                </div>
            </div>
        `;
    });
}

if (document.getElementById("userList") && document.getElementById("newUserName")) {
    renderUsersAdmin();
}

function addUser() {
    const nameEl = document.getElementById("newUserName");
    const passEl = document.getElementById("newUserPassword");
    const roleEl = document.getElementById("newUserRole");
    if (!nameEl || !passEl || !roleEl) return;

    const name = nameEl.value.trim();
    const pass = passEl.value.trim();
    const role = roleEl.value;

    if (!name || !pass) return;

    users.push({ username: name, password: pass, role: role, balance: 0 });
    localStorage.setItem("users", JSON.stringify(users));
    nameEl.value = "";
    passEl.value = "";
    renderUsersAdmin();
}

function editUserName(i, value) {
    users[i].username = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function editUserPassword(i, value) {
    users[i].password = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function editUserRole(i, value) {
    users[i].role = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function resetUserBalance(i) {
    users[i].balance = 0;
    localStorage.setItem("users", JSON.stringify(users));
    renderUsersAdmin();
}

function deleteUser(i) {
    users.splice(i, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderUsersAdmin();
}
