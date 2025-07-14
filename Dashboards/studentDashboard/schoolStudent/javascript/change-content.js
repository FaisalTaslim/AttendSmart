let attendanceContents = document.querySelectorAll('.attendance-status');
let otherContents = document.querySelector('.other-contents');

const query = window.matchMedia("(min-width: 950px) and (max-width: 1024px) and (min-height: 580px) and (max-height: 620px)");

if (query.matches) {
    otherContents.innerHTML = 
    `
        <div class="attendance-related">
            <div class="attendance-status">
                ${attendanceContents[0].innerHTML}
            </div>
            <div class="attendance-status attendance-history">
                ${attendanceContents[1].innerHTML}
            </div>
        </div>
        <div class="not-attendance">
            <div class="leave-and-notices attendance-status">
                ${attendanceContents[2].innerHTML}
            </div>
            <div class="buttons-actions attendance-status">
                ${attendanceContents[3].innerHTML}
            </div>
        </div>
    `
}