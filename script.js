/* ===========================
   FIREBASE INITIALISIERUNG
=========================== */

const firebaseConfig = {
    apiKey: "AIzaSyDd1nQXQl_opqYLwzVdReeGCusCEvPKM9g",
    authDomain: "ge-s-282a1.firebaseapp.com",
    projectId: "ge-s-282a1",
    storageBucket: "ge-s-282a1.firebasestorage.app",
    messagingSenderId: "279960569015",
    appId: "1:279960569015:web:207697cf8728fbed62f932",
    measurementId: "G-HSDYSCHSB6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ===========================
   LOGOUT
=========================== */

function logout() {
    localStorage.removeItem("currentUser");
}

/* ===========================
   LOGIN
=========================== */

if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", async () => {
        const userName = username.value.trim();
        const pass = password.value.trim();
        const msg = message;

        if (!userName || !pass) {
            msg.textContent = "Bitte alles ausfüllen.";
            return;
        }

        try {
            const snap = await db.collection("users").doc(userName).get();
            if (!snap.exists) {
                msg.textContent = "❌ Benutzer nicht gefunden.";
                return;
            }

            const data = snap.data();
            if (data.password !== pass) {
                msg.textContent = "❌ Falsches Passwort.";
                return;
            }

            localStorage.setItem("currentUser", userName);

            if (data.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "user.html";
            }

        } catch (e) {
            msg.textContent = "Fehler beim Login.";
        }
    });
}

/* ===========================
   USER-SEITE
=========================== */

if (document.getElementById("welcome")) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) window.location.href = "index.html";

    const welcomeEl = document.getElementById("welcome");
    const balanceEl = document.getElementById("balance");
    const warningEl = document.getElementById("warning");
    const drinkListEl = document.getElementById("drinkList");
    const userDrinkListEl = document.getElementById("userDrinkList");

    // User live beobachten
    db.collection("users").doc(currentUser).onSnapshot(doc => {
        const u = doc.data();
        welcomeEl.textContent = "Hallo " + u.username;
        balanceEl.textContent = "Kontostand: " + u.balance.toFixed(2) + " €";
        warningEl.textContent = u.balance >= 30 ? "⚠️ Du hast 30€ erreicht – bitte bezahlen!" : "";
    });

    // Getränke laden
    db.collection("drinks").onSnapshot(snapshot => {
        drinkListEl.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const btn = document.createElement("button");
            btn.className = "drink-button";
            btn.textContent = `${d.name} (${d.price} €)`;

            btn.onclick = async () => {
                const userRef = db.collection("users").doc(currentUser);

                await db.runTransaction(async t => {
                    const userDoc = await t.get(userRef);
                    const data = userDoc.data();
                    const newBalance = (data.balance || 0) + d.price;
                    t.update(userRef, { balance: newBalance });
                });

                // Verbrauch speichern
                await db.collection("drinksHistory").add({
                    user: currentUser,
                    drink: d.name,
                    price: d.price,
                    timestamp: Date.now()
                });
            };

            drinkListEl.appendChild(btn);
        });
    });

    // Alle User anzeigen
    db.collection("users").onSnapshot(snapshot => {
        userDrinkListEl.innerHTML = "";
        snapshot.forEach(doc => {
            const u = doc.data();
            if (u.role === "admin") return;

            const card = document.createElement("div");
            card.className = "user-card";
            card.innerHTML = `
                <strong>${u.username}</strong><br>
                Kontostand: ${u.balance.toFixed(2)} €
            `;
            userDrinkListEl.appendChild(card);
        });
    });
}

/* ===========================
   ADMIN – DASHBOARD
=========================== */

if (document.getElementById("statUsers")) {
    const statUsers = document.getElementById("statUsers");
    const statDebt = document.getElementById("statDebt");
    const statDrinks = document.getElementById("statDrinks");
    const statMax = document.getElementById("statMax");

    db.collection("users").onSnapshot(snapshot => {
        const arr = snapshot.docs.map(d => d.data());

        statUsers.innerHTML = `<h2>${arr.length}</h2><p>Benutzer</p>`;

        const total = arr.reduce((s, u) => s + (u.balance || 0), 0);
        statDebt.innerHTML = `<h2>${total.toFixed(2)} €</h2><p>Gesamtschulden</p>`;

        const max = arr.length ? Math.max(...arr.map(u => u.balance || 0)) : 0;
        statMax.innerHTML = `<h2>${max.toFixed(2)} €</h2><p>Höchster Kontostand</p>`;
    });

    db.collection("drinks").onSnapshot(snapshot => {
        statDrinks.innerHTML = `<h2>${snapshot.size}</h2><p>Getränke</p>`;
    });
}

/* ===========================
   ADMIN – BENUTZER
=========================== */

if (document.getElementById("adminUserList")) {
    const list = document.getElementById("adminUserList");

    db.collection("users").onSnapshot(snapshot => {
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const u = doc.data();
            const id = doc.id;

            list.innerHTML += `
                <div class="user-card">
                    <input value="${u.username}" onchange="editUserName('${id}', this.value)">
                    <input value="${u.password}" onchange="editUserPassword('${id}', this.value)">
                    <select onchange="editUserRole('${id}', this.value)">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                    <button onclick="resetUserBalance('${id}')">Reset €</button>
                    <button class="danger" onclick="deleteUser('${id}')">Löschen</button>
                </div>
            `;
        });
    });
}

async function addUser() {
    const name = newUserName.value.trim();
    const pass = newUserPassword.value.trim();
    const role = newUserRole.value;

    if (!name || !pass) return;

    await db.collection("users").doc(name).set({
        username: name,
        password: pass,
        role,
        balance: 0
    });

    newUserName.value = "";
    newUserPassword.value = "";
}

async function editUserName(oldId, newName) {
    if (!newName || oldId === newName) return;

    const oldRef = db.collection("users").doc(oldId);
    const snap = await oldRef.get();
    if (!snap.exists) return;

    const data = snap.data();
    await db.collection("users").doc(newName).set({
        ...data,
        username: newName
    });

    await oldRef.delete();
}

async function editUserPassword(id, value) {
    await db.collection("users").doc(id).update({ password: value });
}

async function editUserRole(id, value) {
    await db.collection("users").doc(id).update({ role: value });
}

async function resetUserBalance(id) {
    await db.collection("users").doc(id).update({ balance: 0 });
}

async function deleteUser(id) {
    await db.collection("users").doc(id).delete();
}

/* ===========================
   ADMIN – GETRÄNKE
=========================== */

if (document.getElementById("drinkAdminList")) {
    const list = document.getElementById("drinkAdminList");

    db.collection("drinks").onSnapshot(snapshot => {
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const id = doc.id;

            list.innerHTML += `
                <div class="user-card">
                    <input value="${d.name}" onchange="editDrinkName('${id}', this.value)">
                    <input value="${d.price}" onchange="editDrinkPrice('${id}', this.value)">
                    <button class="danger" onclick="deleteDrink('${id}')">Löschen</button>
                </div>
            `;
        });
    });
}

async function addDrink() {
    const name = newDrinkName.value.trim();
    const price = parseFloat(newDrinkPrice.value);

    if (!name || isNaN(price)) return;

    await db.collection("drinks").add({ name, price });

    newDrinkName.value = "";
    newDrinkPrice.value = "";
}

async function editDrinkName(id, value) {
    await db.collection("drinks").doc(id).update({ name: value });
}

async function editDrinkPrice(id, value) {
    const p = parseFloat(value);
    if (!isNaN(p)) {
        await db.collection("drinks").doc(id).update({ price: p });
    }
}

async function deleteDrink(id) {
    await db.collection("drinks").doc(id).delete();
}

/* ===========================
   ADMIN – KASSE
=========================== */

if (document.getElementById("cashDisplay")) {
    const cashDisplay = document.getElementById("cashDisplay");

    db.collection("settings").doc("cash").onSnapshot(doc => {
        const data = doc.data() || { cash: 0 };
        cashDisplay.textContent = data.cash.toFixed(2) + " €";
    });
}

async function editCash() {
    const docRef = db.collection("settings").doc("cash");
    const snap = await docRef.get();
    const current = snap.exists ? snap.data().cash : 0;

    const newAmount = Number(prompt("Neuer Kassenstand:", current));
    if (!isNaN(newAmount)) {
        await docRef.set({ cash: newAmount });
    }
}

async function resetAllBalances() {
    if (!confirm("Wirklich ALLE Schulden zurücksetzen?")) return;

    const snap = await db.collection("users").get();
    const batch = db.batch();

    snap.forEach(doc => batch.update(doc.ref, { balance: 0 }));

    await batch.commit();
    alert("Alle Schulden wurden zurückgesetzt.");
}

/* ===========================
   ADMIN – STATISTIK
=========================== */

if (document.getElementById("stats")) {
    const statsEl = document.getElementById("stats");

    db.collection("drinksHistory").onSnapshot(snapshot => {
        const stats = {};

        snapshot.forEach(doc => {
            const d = doc.data();
            stats[d.drink] = (stats[d.drink] || 0) + 1;
        });

        statsEl.innerHTML = "";

        Object.entries(stats).forEach(([drink, count]) => {
            statsEl.innerHTML += `<p>${drink}: ${count}× getrunken</p>`;
        });
    });
}
