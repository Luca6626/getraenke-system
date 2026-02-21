let users = JSON.parse(localStorage.getItem("users"));
let drinks = JSON.parse(localStorage.getItem("drinks")) || [
    { name: "Cola", price: 2 },
    { name: "Wasser", price: 1 },
    { name: "Eistee", price: 1.5 }
];

localStorage.setItem("drinks", JSON.stringify(drinks));

const currentUser = localStorage.getItem("currentUser");
const user = users.find(u => u.username === currentUser);

document.getElementById("welcome").textContent = "Hallo " + user.username;

function updateUI() {
    document.getElementById("balance").textContent =
        "Kontostand: " + user.balance.toFixed(2) + " €";

    document.getElementById("warning").textContent =
        user.balance >= 30 ? "⚠ Du hast 30€ erreicht – bitte bezahlen!" : "";
}

updateUI();

const drinkList = document.getElementById("drinkList");

drinks.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = `${d.name} (${d.price} €)`;
    btn.className = "button";
    btn.onclick = () => {
        user.balance += d.price;
        localStorage.setItem("users", JSON.stringify(users));
        updateUI();
    };
    drinkList.appendChild(btn);
});
