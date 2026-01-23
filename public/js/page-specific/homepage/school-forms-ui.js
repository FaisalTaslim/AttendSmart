const orgSelect2 = document.querySelector("#orgSelect2");
const classSelect = document.querySelector("#flood-class");

const MajorSelect2 = document.querySelector("#MajorSelect2");
const MinorSelect2 = document.querySelector("#MinorSelect2");
const OptionalSelect2 = document.querySelector("#OptionalSelect2");

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

        resetSelect(orgSelect2, "-- Select Organization --");

        organizations.forEach(org => {
            const opt = document.createElement("option");
            opt.value = org.code;
            opt.textContent = `${org.org} - ${org.branch}`;
            orgSelect2.appendChild(opt);
        });

    } catch (err) {
        console.error("Failed to load organizations", err);
    }
}

function floodSchoolClasses(orgCode) {
    resetSelect(classSelect, "-- Select Class --");
    resetSelect(MajorSelect2, "", true);
    resetSelect(MinorSelect2, "", true);
    resetSelect(OptionalSelect2, "", true);

    const org = organizations.find(o => o.code === orgCode);
    if (!org || !org.subjects) return;

    org.subjects.forEach(subject => {
        const opt = document.createElement("option");
        opt.value = subject.class;
        opt.textContent = subject.class;
        classSelect.appendChild(opt);
    });
}

function addPlaceholder(selectEl, text) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    opt.disabled = true;
    opt.selected = true;
    selectEl.appendChild(opt);
}

function floodSchoolSubjects(selectedClass) {
    resetSelect(MajorSelect2, "", true);
    resetSelect(MinorSelect2, "", true);
    resetSelect(OptionalSelect2, "", true);

    const org = organizations.find(o => o.code === orgSelect2.value);
    if (!org) return;

    const subjectBlock = org.subjects.find(s => s.class === selectedClass);
    if (!subjectBlock) return;

    if (subjectBlock.majors?.length) {
        addPlaceholder(MajorSelect2, "-- Select majors --");
        subjectBlock.majors.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m;
            opt.selected = true;
            MajorSelect2.appendChild(opt);
        });

        MajorSelect2.addEventListener("mousedown", e => e.preventDefault());
        MajorSelect2.addEventListener("keydown", e => e.preventDefault());
    } else {
        addPlaceholder(MajorSelect2, "No majors available");
    }

    if (subjectBlock.minors?.length) {
        addPlaceholder(MinorSelect2, "-- Select minors --");
        subjectBlock.minors.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m;
            MinorSelect2.appendChild(opt);
        });
    } else {
        addPlaceholder(MinorSelect2, "No minors available");
    }

    if (subjectBlock.optionals?.length) {
        addPlaceholder(OptionalSelect2, "-- Select optionals --");
        subjectBlock.optionals.forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            OptionalSelect2.appendChild(opt);
        });
    } else {
        addPlaceholder(OptionalSelect2, "No optionals available");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadOrganizations2();
});

orgSelect2.addEventListener("change", e => {
    floodSchoolClasses(e.target.value);
});

classSelect.addEventListener("change", e => {
    floodSchoolSubjects(e.target.value);
});
