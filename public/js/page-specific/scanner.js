const statusEl = document.getElementById("status");
let isProcessing = false;

async function onScanSuccess(decodedText) {
  if (isProcessing) return;

  isProcessing = true;
  statusEl.innerText = "QR detected...";

  try {
    const qrData = JSON.parse(decodedText);

    await html5QrCode.stop();

    const res = await fetch(`/attendance/process-qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrData: decodedText,
      }),
    });

    const data = await res.json();

    if (data.success) {
      statusEl.innerText = "Attendance session joined successfully";

      const params = new URLSearchParams({
        popupType: "success",
        popupMessage: data.message,
        user: data.user,
        type: data.type,
        sessionCode: data.sessionCode,
        key: data.key,
        subject: data.subject,
        dept: data.dept,
      });

      window.location.href = `/app/capture-attendance?${params.toString()}`;
    } else {
      statusEl.innerText = data.message || "process failed";
      isProcessing = false;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        onScanSuccess,
      );
    }
  } catch (err) {
    statusEl.innerText = err.message;
    isProcessing = false;

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      onScanSuccess,
    );
  }
}

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
  { facingMode: "environment" },
  {
    fps: 10,
    qrbox: 250,
  },
  onScanSuccess,
);