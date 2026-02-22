(() => {
    const mobileNav = document.getElementById('mobile-nav');
    const video = document.getElementById('live-camera');
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('camera-status-text');
    const hintText = document.getElementById('video-hint');
    const liveTime = document.getElementById('live-time');

    let stream = null;

    const setCameraState = (active) => {
        if (active) {
            statusDot.classList.remove('dot-off');
            statusDot.classList.add('dot-on');
            statusText.textContent = 'Camera live';
            hintText.textContent = 'Camera is active. Keep faces inside the frame.';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            return;
        }

        statusDot.classList.remove('dot-on');
        statusDot.classList.add('dot-off');
        statusText.textContent = 'Camera idle';
        hintText.textContent = 'Click "Start Camera" to begin preview.';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };

    const stopCamera = () => {
        if (!stream) return;
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
        video.srcObject = null;
        setCameraState(false);
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusText.textContent = 'Camera unsupported on this browser';
            hintText.textContent = 'Use a modern browser with camera permissions enabled.';
            return;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });

            video.srcObject = stream;
            setCameraState(true);
        } catch (error) {
            statusText.textContent = 'Camera access denied';
            hintText.textContent = 'Allow camera permission and try again.';
        }
    };

    if (mobileNav) {
        mobileNav.addEventListener('change', (event) => {
            if (!event.target.value) return;
            window.location.href = event.target.value;
        });
    }

    if (startBtn && stopBtn) {
        startBtn.addEventListener('click', startCamera);
        stopBtn.addEventListener('click', stopCamera);
    }

    window.addEventListener('beforeunload', stopCamera);

    if (liveTime) {
        const refreshClock = () => {
            const now = new Date();
            liveTime.textContent = now.toLocaleTimeString();
        };

        refreshClock();
        setInterval(refreshClock, 1000);
    }
})();
