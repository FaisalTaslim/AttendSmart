const form2 = document.getElementById("s-form");
const fileInput2 = document.getElementById("faceImage2");

form2.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file2 = fileInput2.files[0];
    if (!file2) {
        alert("Please select a face image");
        return;
    }

    console.log(file2);

    const img2 = await faceapi.bufferToImage(file2);

    const detection = await faceapi
        .detectSingleFace(img2)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        alert("Face not detected clearly");
        return;
    }

    const descriptor2 = Array.from(detection.descriptor);
    const formData2 = new FormData(form2);

    const subjects = formData2
        .getAll("subjects")
        .map(s => s.trim())
        .filter(Boolean);

    formData2.delete("subjects");

    const data = Object.fromEntries(formData2.entries());
    data.subjects = subjects;
    data.faceDescriptor = descriptor2;

    await fetch("/registration/student/school", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    alert("Registration submitted Check Your registered mail!!");
});