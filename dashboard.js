let users = JSON.parse(localStorage.getItem("users")) || [];
let drinks = JSON.parse(localStorage.getItem("drinks")) || [];

// Anzahl User
document.getElementById("userCount").innerHTML =
    `<h2>${users.length}</h2><p>Registrierte Benutzer</p>`;

// Gesamtbetrag aller Schulden
let total = users.reduce((sum, u) => sum + u.balance, 0);
document.getElementById("totalDebt").innerHTML =
    `<h2>${total.toFixed(2)} €</h2><p>Gesamtschulden</p>`;

// Anzahl Getränke
document.getElementById("drinkCount").innerHTML =
    `<h2>${drinks.length}</h2><p>Getränke verfügbar</p>`;

// Höchster Schuldenstand
let max = Math.max(...users.map(u => u.balance));
document.getElementById("maxDebt").innerHTML =
    `<h2>${max.toFixed(2)} €</h2><p>Höchster Kontostand</p>`;

function resetSystem() {
    if (confirm("Willst du wirklich ALLES zurücksetzen?")) {
        localStorage.clear();
        location.reload();
    }
}
