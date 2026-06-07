let faceMatcher;
let attendanceMarked = false;

async function initializeRecognition() {
  await window.faceModelsReady;

  const url =
    window.capturePageData.isUser === "student"
      ? `/face/fetch-data?user=student&dept=${window.capturePageData.dept}`
      : `/face/fetch-data?user=employee`;

  const res = await fetch(url);
  const data = await res.json();

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
      `/face/mark-attendance?user=${window.capturePageData.isUser}`,
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

window.faceModelsReady
  .then(() => {
    initializeRecognition();
  })
  .catch((err) => {
    console.error("Cannot start recognition, models failed:", err);
  });
