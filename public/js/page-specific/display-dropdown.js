const registerSelect = document.getElementById("registerSelect");
const supportSelect = document.getElementById("supportSelect");

const idArrays = [
    'admin-form-box',
    'college-std-form-box',
    'school-std-form-box',
    'employee-form-box'
];

const supportIdArrays = [
    'faq-section',
    'issue-form-section'
];

registerSelect.addEventListener("change", () => {
    const selectedId = registerSelect.value;
    const registrationContainer = document.querySelector('.registration-forms');

    idArrays.forEach(id => {
        const form = document.getElementById(id);
        if (form) {
            form.classList.remove('active');
            form.classList.add('hidden');
        }
    });

    if (selectedId) {
        const selectedForm = document.getElementById(selectedId);
        if (selectedForm) {
            selectedForm.classList.remove('hidden');
            selectedForm.classList.add('active');
        }
        if (registrationContainer) registrationContainer.style.display = "flex";
    } else {
        if (registrationContainer) registrationContainer.style.display = "none";
    }
});

supportSelect.addEventListener("change", () => {
    const selectedId = supportSelect.value;
    const supportContainer = document.querySelector('.support-forms');

    supportIdArrays.forEach(id => {
        const form = document.getElementById(id);
        if (form) {
            form.classList.remove('active');
            form.classList.add('hidden');
        }
    });

    if (selectedId) {
        const selectedForm = document.getElementById(selectedId);
        if (selectedForm) {
            selectedForm.classList.remove('hidden');
            selectedForm.classList.add('active');
        }
        if (supportContainer) supportContainer.style.display = "flex";
    } else {
        if (supportContainer) supportContainer.style.display = "none";
    }
});
