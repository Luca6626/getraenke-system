let users = JSON.parse(localStorage.getItem("users")) || [
    { username: "Admin", password: "1918", role: "admin", balance: 0 },
    { username: "Luca", password: "6626", role: "user", balance: 0 },
    { username: "Matthias", password: "3476", role: "user", balance 0},
    { username: "Ludwig", password: "6784", role: "user", balance 0},
    { username: "Tobias", password: "9345", role: "user", balance 0},
    { username: "Philipp", password: "2344", role: "user", balance 0},
    { username: "Lukas", password: "4635", role: "user", balance 0},
    { username: "Max", password: "9674", role: "user", balance: 0 }
];

localStorage.setItem("users", JSON.stringify(users));

document.getElementById("loginBtn").addEventListener("click", () => {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    const found = users.find(u => u.username === user && u.password === pass);

    if (!found) {
        document.getElementById("message").textContent = "Falsche Daten!";
        return;
    }

    localStorage.setItem("currentUser", found.username);

    if (found.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
});
