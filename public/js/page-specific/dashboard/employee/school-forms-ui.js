/**
 * Cascading select logic for the "Start Attendance Session" form.
 * Expects `window.organizations` to be set BEFORE this script runs, e.g.:
 *
 *   <script>
 *     window.organizations = <%- JSON.stringify(organizations) %>;
 *   </script>
 *   <script src="/js/page-specific/dashboards/start-session-form.js"></script>
 *
 * Each organization is expected to look like:
 *   {
 *     code: "ABC123",
 *     org: "Some College",
 *     branch: "Main Branch",
 *     type: "college" | "school",
 *     subjects: [
 *       { class: "CSE", majors: [...], minors: [...], optionals: [...] },
 *       ...
 *     ]
 *   }
 */

(function () {
  const organizations = window.organizations || [];

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

    // If this section isn't in the DOM (e.g. the other workPlace branch
    // rendered instead), silently skip — this is expected, not an error.
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

      populateSelect(majorSelect, [], "-- Select Major --");
      populateSelect(minorSelect, [], "-- Select Minor --");
      populateSelect(optionalSelect, [], "-- Select Optional --");

      if (!organization || !Array.isArray(organization.subjects)) {
        populateSelect(classSelect, [], config.classPlaceholder);
        return;
      }

      populateSelect(
        classSelect,
        organization.subjects.map((subject) => subject.class),
        config.classPlaceholder,
      );
    });

    classSelect.addEventListener("change", () => {
      const organization = getOrganization(orgSelect.value);
      if (!organization || !Array.isArray(organization.subjects)) return;

      const subject = organization.subjects.find(
        (item) => String(item.class) === classSelect.value,
      );

      if (!subject) {
        populateSelect(majorSelect, [], "-- Select Major --");
        populateSelect(minorSelect, [], "-- Select Minor --");
        populateSelect(optionalSelect, [], "-- Select Optional --");
        return;
      }

      populateSelect(majorSelect, subject.majors || [], "-- Select Major --");
      populateSelect(minorSelect, subject.minors || [], "-- Select Minor --");
      populateSelect(
        optionalSelect,
        subject.optionals || [],
        "-- Select Optional --",
      );
    });
  }

  // College branch
  setupOrganizationForm({
    orgSelect: "#orgSelect",
    classSelect: "#flood-department",
    majorSelect: "#majorSelect1",
    minorSelect: "#minorSelect1",
    optionalSelect: "#optionalSelect1",
    classPlaceholder: "-- Select Department --",
  });

  // School branch
  setupOrganizationForm({
    orgSelect: "#orgSelect2",
    classSelect: "#flood-class",
    majorSelect: "#MajorSelect2",
    minorSelect: "#MinorSelect2",
    optionalSelect: "#OptionalSelect2",
    classPlaceholder: "-- Select Class --",
  });
})();