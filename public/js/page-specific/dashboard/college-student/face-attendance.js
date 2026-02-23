(() => {
    const video = document.getElementById('attendance-live-video');
    const startButton = document.getElementById('start-attendance-camera');
    const stopButton = document.getElementById('stop-attendance-camera');
    const captureStatus = document.getElementById('capture-status');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const otpForm = document.getElementById('attendance-otp-form');
    const subjectSelect = document.getElementById('attendance-subject');
    const otpInput = document.getElementById('attendance-otp');
    const otpFeedback = document.getElementById('otp-feedback');

    if (!video || !startButton || !stopButton || !captureStatus || !videoPlaceholder || !otpForm || !subjectSelect || !otpInput || !otpFeedback) {
        return;
    }

    let stream = null;

    const setStatus = (isActive, text) => {
        captureStatus.textContent = text;
        captureStatus.classList.toggle('active', isActive);
        captureStatus.classList.toggle('idle', !isActive);
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
        }

        video.srcObject = null;
        videoPlaceholder.classList.remove('hidden');
        startButton.disabled = false;
        stopButton.disabled = true;
        setStatus(false, 'Camera idle');
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus(false, 'Camera unsupported');
            return;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });

            video.srcObject = stream;
            videoPlaceholder.classList.add('hidden');
            startButton.disabled = true;
            stopButton.disabled = false;
            setStatus(true, 'Camera active');
        } catch (error) {
            console.error('Unable to start camera:', error);
            setStatus(false, 'Permission denied');
        }
    };

    startButton.addEventListener('click', startCamera);
    stopButton.addEventListener('click', stopCamera);

    otpForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const otp = otpInput.value.trim();
        const selectedSubject = subjectSelect.value.trim();
        const isValidOtp = /^\d{6}$/.test(otp);

        otpFeedback.classList.remove('success', 'error');

        if (!isValidOtp) {
            otpFeedback.textContent = 'Enter a valid 6-digit OTP.';
            otpFeedback.classList.add('error');
            return;
        }

        otpFeedback.textContent = selectedSubject
            ? `OTP format verified for ${selectedSubject}. Attendance request is ready to submit.`
            : 'OTP format verified. Attendance request is ready to submit.';
        otpFeedback.classList.add('success');
    });

    window.addEventListener('beforeunload', stopCamera);
})();
