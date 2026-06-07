let faceMatcher;
let attendanceMarked = false;
const faceModelsReady = window.faceModelsReady || Promise.resolve();
window.faceModelsReady = faceModelsReady;

async function initializeRecognition() {
  await window.faceModelsReady;

  const url =
    window.capturePageData.isUser === "student"
      ? `/face-api/fetch-data?user=student&type=${window.capturePageData.type || ""}&dept=${window.capturePageData.dept || ""}`
      : `/face-api/fetch-data?user=employee`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to load face data");
  }

  const labeledDescriptors = data.users.map((user) => {
    return new faceapi.LabeledFaceDescriptors(
      user.code,
      user.descriptors.map((descriptor) => new Float32Array(descriptor)),
    );
  });

  console.log('labelled descriptors', labeledDescriptors);
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  startRecognitionLoop();
}

async function startRecognitionLoop() {
  const interval = setInterval(async () => {
    if (attendanceMarked) {
      clearInterval(interval);
      return;
    }

    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return;

    const match = faceMatcher.findBestMatch(detection.descriptor);
    console.log(match.toString());

    if (match.label === "unknown") return;

    attendanceMarked = true;
    await markAttendance(match.label);
    clearInterval(interval);
  }, 1000);
}

async function markAttendance(userCode) {
  try {
    const res = await fetch(
      `/face-api/mark-attendance?user=${window.capturePageData.isUser}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionCode: window.capturePageData.sessionCode,
          type: window.capturePageData.type,
          isUser: window.capturePageData.isUser,
          userCode,
          dept: window.capturePageData.dept,
          subject: window.capturePageData.subject,
        }),
      },
    );

    const data = await res.json();
    if (data.success) {
      console.log("Attendance marked for:", userCode);
      stopCamera();
    } else {
      attendanceMarked = false;
      console.error(data.message);
    }
  } catch (err) {
    attendanceMarked = false;
    console.error(err);
  }
}

faceModelsReady
  .then(() => {
    initializeRecognition();
  })
  .catch((err) => {
    console.error("Cannot start recognition, models failed:", err);
  });
