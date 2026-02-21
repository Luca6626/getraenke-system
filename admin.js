let users = JSON.parse(localStorage.getItem("users"));

const userList = document.getElementById("userList");

users.forEach(u => {
    if (u.role === "admin") return;

    const div = document.createElement("div");
    div.innerHTML = `
        <p><b>${u.username}</b>: ${u.balance.toFixed(2)} €</p>
        <button onclick="resetBalance('${u.username}')">Zurücksetzen</button>
        <hr>
    `;
    userList.appendChild(div);
});

function resetBalance(name) {
    let users = JSON.parse(localStorage.getItem("users"));
    const user = users.find(u => u.username === name);
    user.balance = 0;
    localStorage.setItem("users", JSON.stringify(users));
    location.reload();
}
