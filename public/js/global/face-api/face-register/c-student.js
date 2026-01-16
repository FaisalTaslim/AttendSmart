const form = document.getElementById("c-form");
const fileInput = document.getElementById("faceImage");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a face image");
        return;
    }

    const img = await faceapi.bufferToImage(file);

    const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        alert("Face not detected clearly");
        return;
    }

    const descriptor = Array.from(detection.descriptor);
    const formData = new FormData(form);

    const subjects = formData
        .getAll("subjects")
        .map(s => s.trim())
        .filter(Boolean);

    formData.delete("subjects");

    const data = Object.fromEntries(formData.entries());
    data.subjects = subjects;
    data.faceDescriptor = descriptor;

    await fetch("/registration/student/college", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    alert("Registration submitted Check Your registered mail!!");
});