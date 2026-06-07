const statusEl = document.getElementById("status");

let isProcessing = false;
let type;
let modifySubject;

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

      if (!qrData.subject) {
        type = "school-student";
        modifySubject = null;
      } else {
        type = "college-student";
        modifySubject = qrData.subject;
      }

      const params = new URLSearchParams({
        for: "student",
        type,
        session: qrData.sessionCode,
        key: qrData.sessionKey,
      });

      if (modifySubject !== null) {
        params.set("subject", modifySubject);
      }

      if (qrData.dept) {
        params.set("dept", qrData.dept);
      }

      window.location.href = `/dashboard/admin/capture-attendance?${params.toString()}`;
    } else {
      statusEl.innerText = data.message || "Failed";
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
