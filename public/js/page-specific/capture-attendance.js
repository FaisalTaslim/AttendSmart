const video = document.getElementById("live-camera");

const startBtn = document.getElementById("start-camera-btn");
const stopBtn = document.getElementById("stop-camera-btn");

const statusText = document.getElementById("camera-status-text");
const statusDot = document.getElementById("status-dot");
const videoHint = document.getElementById("video-hint");

let stream = null;

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
window.addEventListener("beforeunload", stopCamera);

async function startCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera access is not supported in this browser");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;
    video.playsInline = true;

    await video.play();

    statusText.textContent = "Camera active";
    statusDot.classList.remove("dot-off");
    videoHint.textContent = "Camera running";

    startBtn.disabled = true;
    stopBtn.disabled = false;

    attendanceMarked = false;
    attendanceInProgress = false;

    initializeRecognition();
  } catch (err) {
    console.error(err);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    video.srcObject = null;
    statusText.textContent = "Camera access denied";
    videoHint.textContent = "Unable to access camera";
    statusDot.classList.add("dot-off");
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function stopCamera() {
  if (!stream) return;

  stream.getTracks().forEach((track) => track.stop());

  video.srcObject = null;
  video.pause();
  stream = null;

  statusText.textContent = "Camera idle";
  statusDot.classList.add("dot-off");

  videoHint.textContent = 'Click "Start Camera" to begin preview.';

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

const liveTime = document.getElementById("live-time");

function updateTime() {
  const now = new Date();

  liveTime.textContent = now.toLocaleTimeString("en-IN", {
    hour12: true,
  });
}

updateTime();
setInterval(updateTime, 1000);