
const input = document.getElementById("subjectsCsv");
console.log("schedule input:", document.getElementById("scheduleCsv"));

document.addEventListener("DOMContentLoaded", () => {

    const subjectsInput = document.getElementById("subjectsCsv");
    if (subjectsInput) {
        subjectsInput.addEventListener("change", async () => {
            const file = subjectsInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("subjectsCsv", file);

            try {
                const res = await fetch("/upload/admin/subjects/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                alert(res.ok ? data.message : data.error);
            } catch {
                alert("Upload failed. Try again.");
            }
        });
    }

    const scheduleInput = document.getElementById("scheduleCsv");
    if (scheduleInput) {
        scheduleInput.addEventListener("change", async () => {
            const file = scheduleInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("scheduleCsv", file);

            try {
                const res = await fetch("/upload/admin/schedule/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                alert(res.ok ? data.message : data.error);
            } catch {
                alert("Upload failed. Try again.");
            }
        });
    }

});
