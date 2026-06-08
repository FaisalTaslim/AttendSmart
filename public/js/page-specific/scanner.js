const statusEl = document.getElementById("status");

let isProcessing = false;

async function onScanSuccess(decodedText) {
  if (isProcessing) return;

  isProcessing = true;
  statusEl.innerText = "QR detected...";

  try {
    const qrData = JSON.parse(decodedText);
    await html5QrCode.stop();

    const res = await fetch(`/dashboard/student/process-qr`, {
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
        for: data.isUser,
        type: data.type,
        session: data.sessionCode,
        key: data.sessionKey,
        subject: data.subject,
        dept: data.dept,
      });

      window.location.href = `/dashboard/admin/capture-attendance?${params.toString()}`;
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
    console.error(err);
    statusEl.innerText = "Server error";
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
