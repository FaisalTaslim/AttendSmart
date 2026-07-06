const orgSelect3 = document.querySelector("#orgSelect3");
const workPlaceSelect = document.querySelector("#workPlaceSelect");

if (!orgSelect3 || !workPlaceSelect) {
    console.warn("[employee-forms-ui] Missing expected form elements; script disabled.");
} else {

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

async function loadOrganizationsForType(type) {
    try {
        const res = await fetch("/fetch/org-data");
        const data = await res.json();

        if (!data.success) return;

        organizations = (data.organizations || []).filter((o) => o?.type === type);

        resetSelect(orgSelect3, "-- Select Organization --");

        if (!organizations.length) return;

        organizations.forEach(org => {
            const opt = document.createElement("option");
            opt.value = org.code;
            opt.textContent = `${org.org}, ${org.branch}`;
            orgSelect3.appendChild(opt);
        });

    } catch (err) {
        console.error("Failed to load organizations", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    orgSelect3.disabled = true;
    resetSelect(orgSelect3, "-- Select workplace first --");
});

workPlaceSelect.addEventListener("change", async (e) => {
    const type = e.target.value;
    orgSelect3.disabled = !type;
    resetSelect(orgSelect3, "-- Select Organization --");
    if (!type) return;
    await loadOrganizationsForType(type);
});

}
