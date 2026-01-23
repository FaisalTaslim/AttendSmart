const orgSelect = document.querySelector("#orgSelect");
const departmentSelect = document.querySelector("#flood-department");
const majorSelect1 = document.querySelector("#majorSelect1");
const minorSelect1 = document.querySelector("#minorSelect1");
const optionalSelect1 = document.querySelector("#optionalSelect1");

let organizations = [];

async function loadCollegeOrganizations() {
    try {
        const res = await fetch("/public/org/list");
        const data = await res.json();

        if (!data.success) return;

        organizations = data.organizations;

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- Select Organization --";
        placeholder.disabled = true;
        placeholder.selected = true;
        orgSelect.appendChild(placeholder);

        organizations.forEach(org => {
            const option = document.createElement("option");
            option.value = org.code;
            option.textContent = `${org.org} - ${org.branch}`;
            orgSelect.appendChild(option);
        });

    } catch (err) {
        console.error("Failed to load organizations:", err);
    }
}

function floodDepartments(orgCode) {
    departmentSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Select Department --";
    placeholder.disabled = true;
    placeholder.selected = true;
    departmentSelect.appendChild(placeholder);

    const selectedOrg = organizations.find(org => org.code === orgCode);
    if (!selectedOrg || !selectedOrg.subjects) return;

    selectedOrg.subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.class;
        option.textContent = subject.class;
        departmentSelect.appendChild(option);
    });
}

function resetSelect(select, placeholderText) {
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholderText;
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
}

function floodCollegeSubjects(selectedClass) {
    resetSelect(majorSelect1, "-- Select Major --");
    resetSelect(minorSelect1, "-- Select Minor --");
    resetSelect(optionalSelect1, "-- Select Optional --");

    const selectedOrgCode = orgSelect.value;
    const selectedOrg = organizations.find(org => org.code === selectedOrgCode);

    if (!selectedOrg || !selectedOrg.subjects) return;

    const subjectBlock = selectedOrg.subjects.find(
        s => s.class === selectedClass
    );

    if (!subjectBlock) return;

    subjectBlock.majors.forEach(major => {
        const option = document.createElement("option");
        option.value = major;
        option.textContent = major;
        majorSelect1.appendChild(option);
    });

    subjectBlock.minors.forEach(minor => {
        const option = document.createElement("option");
        option.value = minor;
        option.textContent = minor;
        minorSelect1.appendChild(option);
    });

    subjectBlock.optionals.forEach(optional => {
        const option = document.createElement("option");
        option.value = optional;
        option.textContent = optional;
        optionalSelect1.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadCollegeOrganizations();
});

orgSelect.addEventListener("change", e => {
    floodDepartments(e.target.value);
});

departmentSelect.addEventListener("change", (e) => {
    floodCollegeSubjects(e.target.value);
});
