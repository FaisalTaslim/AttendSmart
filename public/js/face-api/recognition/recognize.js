let faceMatcher;
let attendanceMarked = false;
let attendanceInProgress = false;
let unknownFaceDetected = false;
const faceModelsReady = window.faceModelsReady || Promise.resolve();
window.faceModelsReady = faceModelsReady;

function showMessage(text, type = "success", duration = 5000) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = `message ${type} show`;
  el.style.display = "flex";
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(-15px)";
    el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    setTimeout(() => {
      el.style.display = "none";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.transition = "";
    }, 300);
  }, duration);
}

async function initializeRecognition() {
  alert('hitting initialize recognition');
  await window.faceModelsReady;
  const url =
    window.capturePageData.user === "student"
      ? `/fetch/face-data?user=student&type=${window.capturePageData.type || ""}&dept=${window.capturePageData.dept || ""}`
      : `/fetch/face-data?user=employee`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) {
    showMessage(data.message || "Failed to load face data.", "error");
    return;
  }
  const labeledDescriptors = data.users.map((user) => {
    return new faceapi.LabeledFaceDescriptors(
      user.code,
      user.descriptors.map((descriptor) => new Float32Array(descriptor)),
    );
  });
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  startRecognitionLoop();
}

async function startRecognitionLoop() {
  alert('starting recognition loop');
  if (attendanceMarked || attendanceInProgress) return;

  const detections = await faceapi
    .detectAllFaces(video)
    .withFaceLandmarks()
    .withFaceDescriptors();

  alert(`Faces detected: ${detections.length}`);

  if (detections.length > 1) {
    showMessage(
      "Multiple faces detected. Please keep only one face in the frame.",
      "warning",
    );
    stopCamera();
    return;
  }

  if (detections.length === 1) {
    const match = faceMatcher.findBestMatch(detections[0].descriptor);
    alert(`Matched: ${match.label}`);
    alert(`Distance: ${match.distance}`);

    if (match.label !== "unknown") {
      attendanceInProgress = true;
      unknownFaceDetected = false;
      await markAttendance(match.label);
      return;
    }
  } else {
    unknownFaceDetected = false;
  }

  setTimeout(startRecognitionLoop, 1000);
}
async function markAttendance(code) {
  alert('hitting mark attendance route');
  try {
    const res = await fetch(`/attendance/mark-attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionCode: window.capturePageData.sessionCode,
        type: window.capturePageData.type,
        user: window.capturePageData.user,
        code,
        dept: window.capturePageData.dept,
        subject: window.capturePageData.subject,
        key: window.capturePageData.key,
        shift: window.capturePageData.shift,
      }),
    });
    const data = await res.json();
    alert('data', data);
    if (data.success) {
      attendanceMarked = true;
      showMessage(`Attendance marked successfully for ${code}!`, "success");
      stopCamera();
    } else {
      attendanceInProgress = false;
      showMessage(data.message || "Failed to mark attendance.", "error");
    }
  } catch (err) {
    attendanceInProgress = false;
    showMessage("Something went wrong. Please try again.", "error");
  }
}

faceModelsReady
  .then(() => {
    initializeRecognition();
  })
  .catch((err) => {
    showMessage(
      "Face recognition models failed to load. Please refresh.",
      "error",
    );
  });
