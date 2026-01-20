
const input = document.getElementById("subjectsCsv");

input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("subjectsCsv", file);

    try {
        const res = await fetch("/upload/admin/subjects/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Upload failed. Try again.");
    }
});