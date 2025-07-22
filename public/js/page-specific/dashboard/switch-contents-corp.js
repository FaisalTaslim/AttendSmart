const sectionMap = {
  "attendance-overview": "attendance-overview",
  "history": "attendance-history",
  "edit": "edit-info",
  "notice": "notices",
  "leave": "leave-request"
};

const buttons = document.querySelectorAll(".btn");

const sections = document.querySelectorAll(
  ".attendance-overview, .attendance-history, .edit-info, .notices, .leave-request"
);

function hideAllSections() {
  sections.forEach(section => {
    section.style.display = "none";
  });
}

function showSection(className) {
  const target = document.querySelector(`.${className}`);
  if (target) {
    target.style.display = "flex";
  }
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    hideAllSections();
    const targetClass = sectionMap[btn.id];
    showSection(targetClass);
  });
});

// Show overview by default
hideAllSections();
showSection("attendance-overview");
