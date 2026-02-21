let drinks = JSON.parse(localStorage.getItem("drinks")) || [];

const list = document.getElementById("drinkAdminList");

function render() {
    list.innerHTML = "";
    drinks.forEach((d, i) => {
        list.innerHTML += `
            <p>
                <input value="${d.name}" onchange="editName(${i}, this.value)">
                <input value="${d.price}" onchange="editPrice(${i}, this.value)">
                <button onclick="deleteDrink(${i})">Löschen</button>
            </p>
        `;
    });
}

render();

function addDrink() {
    const name = document.getElementById("newDrinkName").value;
    const price = parseFloat(document.getElementById("newDrinkPrice").value);

    drinks.push({ name, price });
    localStorage.setItem("drinks", JSON.stringify(drinks));
    render();
}

function editName(i, value) {
    drinks[i].name = value;
    localStorage.setItem("drinks", JSON.stringify(drinks));
}

function editPrice(i, value) {
    drinks[i].price = parseFloat(value);
    localStorage.setItem("drinks", JSON.stringify(drinks));
}

function deleteDrink(i) {
    drinks.splice(i, 1);
    localStorage.setItem("drinks", JSON.stringify(drinks));
    render();
}
