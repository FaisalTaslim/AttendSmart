document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("attendance-live-video");
    const startBtn = document.getElementById("start-attendance-camera");
    const stopBtn = document.getElementById("stop-attendance-camera");
    const statusText = document.getElementById("capture-status");
    const otpForm = document.getElementById("attendance-otp-form");
    const otpFeedback = document.getElementById("otp-feedback");
    const videoPlaceholder = document.getElementById("video-placeholder");
    const scanOverlay = document.getElementById("scan-overlay");

    let stream = null;
    let detectionInterval = null;
    let faceMatcher = null;
    let loggedInStudentCode = null;
    let faceVerified = false;
    let otpSent = false;

    // -----------------------
    // FETCH STUDENT DESCRIPTOR
    // -----------------------
    async function loadStudentFace() {
        const res = await fetch("/student/face-data");
        const data = await res.json();

        loggedInStudentCode = data.code;

        const labeled = new faceapi.LabeledFaceDescriptors(
            data.code,
            data.descriptors.map(d => new Float32Array(d))
        );

        faceMatcher = new faceapi.FaceMatcher([labeled], 0.6);
    }

    // -----------------------
    // START CAMERA
    // -----------------------
    async function startCamera() {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await window.faceModelsReady;
        await loadStudentFace();

        startBtn.disabled = true;
        stopBtn.disabled = false;

        videoPlaceholder.classList.add("hidden");
        scanOverlay.style.display = "block";
        statusText.textContent = "Scanning...";
        statusText.className = "capture-status scanning";

        detectionLoop();
    }

    // -----------------------
    // STOP CAMERA
    // -----------------------
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }

        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }

        startBtn.disabled = false;
        stopBtn.disabled = true;

        videoPlaceholder.classList.remove("hidden");
        scanOverlay.style.display = "none";
        statusText.textContent = "Camera idle";
        statusText.className = "capture-status idle";
    }

    // -----------------------
    // DETECTION LOOP
    // -----------------------
    function detectionLoop() {

        detectionInterval = setInterval(async () => {

            const detection = await faceapi
                .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                faceVerified = false;
                return;
            }

            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

            if (bestMatch.label === loggedInStudentCode) {

                const sessionCodeVal = document.getElementById("session-code").value.trim();
                const subjectVal = document.getElementById("attendance-subject").value;

                if (!sessionCodeVal || !subjectVal) {
                    statusText.textContent = "Face Verified. Enter Session Code.";
                    statusText.className = "capture-status idle";
                    return;
                }

                if (!otpSent) {
                    faceVerified = true;
                    otpSent = true;

                    statusText.textContent = "Face Verified. Sending OTP...";
                    statusText.className = "capture-status verified";
                    otpFeedback.textContent = "Sending OTP...";
                    otpFeedback.className = "otp-feedback";

                    try {
                        const res = await fetch("/student/send-attendance-otp", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                sessionCode: sessionCodeVal,
                                subject: subjectVal
                            })
                        });

                        if (!res.ok) throw new Error(`Server error: ${res.status}`);
                        const data = await res.json();

                        if (data.success) {
                            otpFeedback.textContent = "OTP sent to your registered email address.";
                            otpFeedback.className = "otp-feedback success";

                            // ✅ Stop detection loop here
                            clearInterval(detectionInterval);
                            detectionInterval = null;

                        } else {
                            throw new Error(data.message || "Failed to send OTP.");
                        }
                    } catch (err) {
                        console.error(err);
                        otpFeedback.textContent = err.message || "Error sending OTP. Try again.";
                        otpFeedback.className = "otp-feedback error";
                        otpSent = false; // Allow retry
                        faceVerified = false;
                    }
                }

            } else {
                faceVerified = false;
            }

        }, 600);
    }

    // -----------------------
    // VERIFY OTP + MARK ATTENDANCE
    // -----------------------
    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!faceVerified) {
            otpFeedback.textContent = "Face not verified.";
            return;
        }

        const formData = new FormData(otpForm);

        const res = await fetch("/student/verify-attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionCode: formData.get("sessionCode"),
                subject: formData.get("subject"),
                otp: formData.get("attendanceOtp")
            })
        });

        const data = await res.json();

        if (data.success) {
            otpFeedback.textContent = "Attendance marked successfully.";
            stopCamera();
        } else {
            otpFeedback.textContent = data.message || "Verification failed.";
        }
    });

    startBtn.addEventListener("click", startCamera);
    stopBtn.addEventListener("click", stopCamera);

});