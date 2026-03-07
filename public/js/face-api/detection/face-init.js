let modelsLoaded = false;
const faceInput = document.getElementById("face");

async function loadFaceModels() {
  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);

  modelsLoaded = true;
  console.log("✅ Face API models loaded");
}


loadFaceModels();

faceInput.addEventListener("change", async () => {
  if (!modelsLoaded) {
    alert("Face recognition models are still loading. Please wait a moment.");
    return;
  }

  if (!faceInput.files.length) return;
  const file = faceInput.files[0];

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file");
    return;
  }

  processFace(file);
});


async function processFace(file) {
  try {
    const img = await faceapi.bufferToImage(file);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected. Please upload a clear image with one face.");
      return;
    }

    const descriptor = Array.from(detection.descriptor);
    uploadDescriptor(descriptor);

  } catch (err) {
    console.error("Face processing error:", err);
    alert("Face processing failed. Try another image.");
  }
}


async function uploadDescriptor(descriptor) {
  const res = await fetch("/dashboard/face-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ descriptor })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Face registration failed");
    return;
  }

  alert("Face registered successfully ✅");
  faceInput.disabled = true;
  location.reload();
}