const orgSelect3 = document.querySelector("#orgSelect3");
let organizations = [];

function resetSelect(select, placeholder, multiple = false) {
    select.innerHTML = "";

    if (!multiple) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = placeholder;
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
    }
}

async function loadOrganizations2() {
    try {
        const res = await fetch("/public/org/list");
        const data = await res.json();

        if (!data.success) return;

        organizations = data.organizations;

        resetSelect(orgSelect3, "-- Select Organization --");

        organizations.forEach(org => {
            const opt = document.createElement("option");
            opt.value = org.code;
            opt.textContent = `${org.org} - ${org.branch}`;
            orgSelect3.appendChild(opt);
        });

    } catch (err) {
        console.error("Failed to load organizations", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadOrganizations2();
});