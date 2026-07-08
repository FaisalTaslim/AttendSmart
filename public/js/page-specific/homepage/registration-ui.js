const organizations = window.organizations || [];
console.log(window.organizations)

function populateSelect(select, values = [], placeholder) {
  if (!select) return;

  select.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;

  select.appendChild(placeholderOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function getOrganization(code) {
  return organizations.find((org) => org.code === code);
}

function setupOrganizationForm(config) {
  const orgSelect = document.querySelector(config.orgSelect);
  const classSelect = document.querySelector(config.classSelect);
  const majorSelect = document.querySelector(config.majorSelect);
  const minorSelect = document.querySelector(config.minorSelect);
  const optionalSelect = document.querySelector(config.optionalSelect);

  if (
    !orgSelect ||
    !classSelect ||
    !majorSelect ||
    !minorSelect ||
    !optionalSelect
  ) {
    return;
  }

  orgSelect.addEventListener("change", () => {
    const organization = getOrganization(orgSelect.value);

    if (!organization) {
      populateSelect(classSelect, [], "-- Select --");
      return;
    }

    populateSelect(
      classSelect,
      organization.subjects.map((subject) => subject.class),
      config.classPlaceholder,
    );

    populateSelect(majorSelect, [], "-- Select Major --");
    populateSelect(minorSelect, [], "-- Select Minor --");
    populateSelect(optionalSelect, [], "-- Select Optional --");
  });

  classSelect.addEventListener("change", () => {
    const organization = getOrganization(orgSelect.value);

    if (!organization) return;

    const subject = organization.subjects.find(
      (item) => item.class === classSelect.value,
    );

    if (!subject) return;

    populateSelect(majorSelect, subject.majors || [], "-- Select Major --");

    populateSelect(minorSelect, subject.minors || [], "-- Select Minor --");

    populateSelect(
      optionalSelect,
      subject.optionals || [],
      "-- Select Optional --",
    );
  });
}

setupOrganizationForm({
  orgSelect: "#orgSelect",
  classSelect: "#flood-department",
  majorSelect: "#majorSelect1",
  minorSelect: "#minorSelect1",
  optionalSelect: "#optionalSelect1",
  classPlaceholder: "-- Select Department --",
});

setupOrganizationForm({
  orgSelect: "#orgSelect2",
  classSelect: "#flood-class",
  majorSelect: "#MajorSelect2",
  minorSelect: "#MinorSelect2",
  optionalSelect: "#OptionalSelect2",
  classPlaceholder: "-- Select Class --",
});