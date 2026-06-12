const sessionData = window.__SESSION_DATA__ || {};
const SESSION_CODE = sessionData.sessionCode || "";
const SESSION_MINS = Number(sessionData.sessionMins || 15);
const JOINED_COUNT = Number(sessionData.joinedCount || 0);

const qrContainer = document.getElementById("qrcode");
qrContainer.innerHTML = `<p style="text-align:center;padding:2rem;">Loading QR...</p>`;

async function refreshQR() {
  try {
    const res = await fetch(
      "/dashboard/employee/teacher/qr/generate-session-key",
    );
    const data = await res.json();
    if (!data.success) return;

    if (!SESSION_CODE) {
      console.error(
        "SESSION_CODE is empty — session data not injected correctly",
      );
      return;
    }

    const payload = JSON.stringify({
      sessionCode: SESSION_CODE,
      sessionKey: data.sessionKey,
      subject: sessionData.subject ?? null,
      dept: sessionData.dept ?? null,
    });

    console.log("QR payload:", payload);

    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: payload,
      width: 200,
      height: 200,
      colorDark: "#1A1A18",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (err) {
    console.error("Failed to refresh QR:", err);
  }
}
refreshQR();
setInterval(refreshQR, 5000);

document.getElementById("code-display").textContent = SESSION_CODE;
document.getElementById("joined-count").textContent =
  JOINED_COUNT + " student" + (JOINED_COUNT !== 1 ? "s" : "");
document.getElementById("date-val").textContent = new Date().toLocaleDateString(
  "en-IN",
  { day: "numeric", month: "short", year: "numeric" },
);

let remaining = SESSION_MINS * 60;
const total = remaining;

function fmt(s) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const timerEl = document.getElementById("timer");
const barEl = document.getElementById("timer-bar");

const tick = setInterval(() => {
  remaining--;
  timerEl.textContent = fmt(remaining);
  const pct = (remaining / total) * 100;
  barEl.style.width = pct + "%";

  if (remaining <= 120) {
    timerEl.classList.add("warning");
    barEl.style.background = "#C84B2F";
  }
  if (remaining <= 0) {
    clearInterval(tick);
    timerEl.textContent = "Expired";
    document.querySelector(".badge .dot").style.animation = "none";
    document.querySelector(".badge .dot").style.background = "#aaa";
    document.querySelector(".badge").style.color = "#aaa";
  }
}, 1000);

const copyBtn = document.getElementById("copy-btn");
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(SESSION_CODE).then(() => {
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }, 2000);
  });
});
