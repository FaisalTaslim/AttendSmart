const faqBtn = document.getElementById("faqBtn");
const issueBtn = document.getElementById("issueBtn");
const faqSection = document.querySelector(".faq-section");
const issueFormSection = document.querySelector(".issue-form-section");

faqBtn.addEventListener("click", () => {
    if(issueFormSection.style.display === 'flex' && faqSection.style.display === 'none') {
        issueFormSection.style.display = 'none';
        faqSection.style.display = 'flex';
    }
    else {
        issueFormSection.style.display = 'none';
        faqSection.style.display = 'flex';
    }
    e.stopPropagation();
});

issueBtn.addEventListener("click", () => {
    if(faqSection.style.display === 'flex' && issueFormSection.style.display === 'none') {
        issueFormSection.style.display = 'flex';
        faqSection.style.display = 'none';
    }
    else {
        issueFormSection.style.display = 'flex';
        faqSection.style.display = 'none';
    }
    e.stopPropagation();
})