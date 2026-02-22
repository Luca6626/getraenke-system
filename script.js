// =============== FIREBASE INITIALISIERUNG =================

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

// =============== HILFSFUNKTIONEN =================

function logout() {
    localStorage.removeItem("currentUser");
}

// =============== LOGIN =================

if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", async () => {
        const userName = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();
        const msg = document.getElementById("message");

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
            console.error(e);
            msg.textContent = "Fehler beim Login.";
        }
    });
}

// =============== USER-SEITE =================

if (document.getElementById("welcome")) {
    const currentUserName = localStorage.getItem("currentUser");
    const welcomeEl = document.getElementById("welcome");
    const balanceEl = document.getElementById("balance");
    const warningEl = document.getElementById("warning");
    const drinkListEl = document.getElementById("drinkList");
    const userDrinkListEl = document.getElementById("userDrinkList");

    if (!currentUserName) {
        window.location.href = "index.html";
    }

    // aktuellen User live beobachten
    db.collection("users").doc(currentUserName).onSnapshot(doc => {
        if (!doc.exists) return;
        const u = doc.data();
        welcomeEl.textContent = "Hallo " + u.username;
        balanceEl.textContent = "Kontostand: " + u.balance.toFixed(2) + " €";
        warningEl.textContent =
            u.balance >= 30 ? "⚠️ Du hast 30€ erreicht – bitte bezahlen!" : "";
    });

    // Getränke laden und Buttons bauen
    db.collection("drinks").onSnapshot(snapshot => {
        drinkListEl.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const btn = document.createElement("button");
            btn.textContent = `${d.name} (${d.price} €)`;
            btn.className = "drink-button";
            btn.onclick = async () => {
                const userRef = db.collection("users").doc(currentUserName);
                await db.runTransaction(async (t) => {
                    const userDoc = await t.get(userRef);
                    const data = userDoc.data();
                    const newBalance = (data.balance || 0) + d.price;
                    t.update(userRef, { balance: newBalance });
                });
            };
            drinkListEl.appendChild(btn);
        });
    });

    // alle Benutzer (ohne Admin) anzeigen
    db.collection("users").onSnapshot(snapshot => {
        userDrinkListEl.innerHTML = "";
        snapshot.forEach(doc => {
            const u = doc.data();
            if (u.role === "admin") return;
            const card = document.createElement("div");
            card.className = "user-card";
            card.innerHTML = `
                <strong>${u.username}</strong><br>
                Kontostand: ${u.balance.toFixed(2)} €<br>
            `;
            userDrinkListEl.appendChild(card);
        });
    });
}

// =============== ADMIN – DASHBOARD =================

if (document.getElementById("statUsers")) {
    const statUsers = document.getElementById("statUsers");
    const statDebt = document.getElementById("statDebt");
    const statDrinks = document.getElementById("statDrinks");
    const statMax = document.getElementById("statMax");

    db.collection("users").onSnapshot(snapshot => {
        const arr = [];
        snapshot.forEach(doc => arr.push(doc.data()));

        statUsers.innerHTML = `<h2>${arr.length}</h2><p>Benutzer</p>`;

        const total = arr.reduce((sum, u) => sum + (u.balance || 0), 0);
        statDebt.innerHTML = `<h2>${total.toFixed(2)} €</h2><p>Gesamtschulden</p>`;

        const max = arr.length ? Math.max(...arr.map(u => u.balance || 0)) : 0;
        statMax.innerHTML = `<h2>${max.toFixed(2)} €</h2><p>Höchster Kontostand</p>`;
    });

    db.collection("drinks").onSnapshot(snapshot => {
        let count = 0;
        snapshot.forEach(() => count++);
        statDrinks.innerHTML = `<h2>${count}</h2><p>Getränke</p>`;
    });
}

// =============== ADMIN – BENUTZER =================

if (document.getElementById("adminUserList")) {
    const list = document.getElementById("adminUserList");

    db.collection("users").onSnapshot(snapshot => {
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const u = doc.data();
            const id = doc.id; // username als ID
            list.innerHTML += `
                <div class="user-card">
                    <input value="${u.username}" onchange="editUserName('${id}', this.value)">
                    <input value="${u.password}" onchange="editUserPassword('${id}', this.value)">
                    <select onchange="editUserRole('${id}', this.value)">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                    <button onclick="resetUserBalance('${id}')">Reset €</button>
                    <button onclick="deleteUser('${id}')">Löschen</button>
                </div>
            `;
        });
    });
}

async function addUser() {
    const name = document.getElementById("newUserName").value.trim();
    const pass = document.getElementById("newUserPassword").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!name || !pass) return;

    await db.collection("users").doc(name).set({
        username: name,
        password: pass,
        role: role,
        balance: 0
    });

    document.getElementById("newUserName").value = "";
    document.getElementById("newUserPassword").value = "";
}

async function editUserName(oldId, newName) {
    if (!newName || oldId === newName) return;

    const oldRef = db.collection("users").doc(oldId);
    const snap = await oldRef.get();
    if (!snap.exists) return;
    const data = snap.data();

    const newRef = db.collection("users").doc(newName);
    await newRef.set({
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

// =============== ADMIN – GETRÄNKE =================

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
                    <button onclick="deleteDrink('${id}')">Löschen</button>
                </div>
            `;
        });
    });
}

async function addDrink() {
    const name = document.getElementById("newDrinkName").value.trim();
    const price = parseFloat(document.getElementById("newDrinkPrice").value);

    if (!name || isNaN(price)) return;

    await db.collection("drinks").add({ name, price });

    document.getElementById("newDrinkName").value = "";
    document.getElementById("newDrinkPrice").value = "";
}

async function editDrinkName(id, value) {
    await db.collection("drinks").doc(id).update({ name: value });
}

async function editDrinkPrice(id, value) {
    const p = parseFloat(value);
    if (isNaN(p)) return;
    await db.collection("drinks").doc(id).update({ price: p });
}

async function deleteDrink(id) {
    await db.collection("drinks").doc(id).delete();
}

// =============== ADMIN – KASSE =================

if (document.getElementById("cashDisplay")) {
    const cashDisplay = document.getElementById("cashDisplay");

    db.collection("settings").doc("cash").onSnapshot(doc => {
        if (!doc.exists) {
            cashDisplay.textContent = "0.00 €";
            return;
        }
        const data = doc.data();
        cashDisplay.textContent = (data.cash || 0).toFixed(2) + " €";
    });
}

async function editCash() {
    const docRef = db.collection("settings").doc("cash");
    const snap = await docRef.get();
    const current = snap.exists ? (snap.data().cash || 0) : 0;
    const newAmount = Number(prompt("Neuer Kassenstand:", current));
    if (isNaN(newAmount)) return;

    await docRef.set({ cash: newAmount });
}

async function resetAllBalances() {
    if (!confirm("Wirklich ALLE Schulden zurücksetzen?")) return;

    const snap = await db.collection("users").get();
    const batch = db.batch();
    snap.forEach(doc => {
        batch.update(doc.ref, { balance: 0 });
    });
    await batch.commit();
    alert("Alle Schulden wurden zurückgesetzt.");
}
