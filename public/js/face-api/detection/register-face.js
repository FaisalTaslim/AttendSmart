const faceInput = document.getElementById("face");

faceInput.addEventListener("change", async () => {
  await window.faceModelsReady;

  if (!faceInput.files.length) return;

  const files = Array.from(faceInput.files);

  const invalidFiles = files.filter(
    file => !file.type.startsWith("image/")
  );

  if (invalidFiles.length) {
    alert("Please upload valid image files only");
    return;
  }

  const descriptors = [];
  let failedCount = 0;

  for (const file of files) {

    const descriptor = await processFace(file);

    if (descriptor) {
      descriptors.push(descriptor);
    } else {
      failedCount += 1;
    }

  }

  if (!descriptors.length) {
    alert("No faces detected. Please upload clear images with one face each.");
    return;
  }

  await uploadDescriptors(descriptors, failedCount);

});


async function processFace(file) {
  try {
    const img = await faceapi.bufferToImage(file);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return Array.from(detection.descriptor);

  } catch (err) {
    console.error("Face processing error:", err);
    return null;
  }
}


async function uploadDescriptors(descriptors, failedCount) {
  const res = await fetch("/uploads/register-face", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ descriptors })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Face registration failed");
    return;
  }

  if (failedCount) {
    alert(`Face registered successfully ✅\n${failedCount} image(s) failed face detection.`);
  } else {
    alert("Face registered successfully ✅");
  }
  faceInput.disabled = true;
  location.reload();
}