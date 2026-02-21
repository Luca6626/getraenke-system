let users = JSON.parse(localStorage.getItem("users")) || [];

const list = document.getElementById("userList");

function render() {
    list.innerHTML = "";

    users.forEach((u, i) => {
        list.innerHTML += `
            <div class="user-row">
                <input value="${u.username}" onchange="editName(${i}, this.value)">
                <input value="${u.password}" onchange="editPassword(${i}, this.value)">
                <select onchange="editRole(${i}, this.value)">
                    <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                    <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                </select>
                <button onclick="resetBalance(${i})">Reset €</button>
                <button onclick="deleteUser(${i})">Löschen</button>
            </div>
            <hr>
        `;
    });
}

render();

function addUser() {
    const name = document.getElementById("newUserName").value;
    const pass = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;

    users.push({ username: name, password: pass, role: role, balance: 0 });
    localStorage.setItem("users", JSON.stringify(users));
    render();
}

function editName(i, value) {
    users[i].username = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function editPassword(i, value) {
    users[i].password = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function editRole(i, value) {
    users[i].role = value;
    localStorage.setItem("users", JSON.stringify(users));
}

function resetBalance(i) {
    users[i].balance = 0;
    localStorage.setItem("users", JSON.stringify(users));
    render();
}

function deleteUser(i) {
    users.splice(i, 1);
    localStorage.setItem("users", JSON.stringify(users));
    render();
}
