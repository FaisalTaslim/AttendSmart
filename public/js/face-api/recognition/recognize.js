let faceMatcher;
let attendanceMarked = false;
let attendanceInProgress = false;

const faceModelsReady = window.faceModelsReady || Promise.resolve();
window.faceModelsReady = faceModelsReady;

async function initializeRecognition() {
  console.log("initializeRecognition()");
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

  console.log("labelled descriptors", labeledDescriptors);
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  startRecognitionLoop();
}

async function startRecognitionLoop() {
  if (attendanceMarked || attendanceInProgress) return;

  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (detection) {
    const match = faceMatcher.findBestMatch(detection.descriptor);

    if (match.label !== "unknown") {
      attendanceInProgress = true;
      await markAttendance(match.label);
      return;
    }
  }

  setTimeout(startRecognitionLoop, 1000);
}

async function markAttendance(userCode) {
  console.log("markAttendance()");

  try {
    const res = await fetch(
      `/face-api/mark-attendance?user=${window.capturePageData.isUser}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: window.capturePageData.sessionCode,
          type: window.capturePageData.type,
          isUser: window.capturePageData.isUser,
          userCode,
          dept: window.capturePageData.dept,
          subject: window.capturePageData.subject,
          key: window.capturePageData.key,
        }),
      },
    );
    const data = await res.json();
    if (data.success) {
      attendanceMarked = true;
      console.log("Attendance marked for:", userCode);
      stopCamera();
    } else {
      attendanceInProgress = false;
      console.error(data.message);
    }
  } catch (err) {
    attendanceInProgress = false;
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
