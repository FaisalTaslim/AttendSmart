function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    console.log("✅ DOM Ready, initializing QR scanner...");

    function onScanSuccess(decodeText) {
        console.log("📸 QR detected:", decodeText);

        let qrData;
        try {
            qrData = JSON.parse(decodeText);
        } catch (err) {
            alert("⚠️ Invalid QR code format!");
            console.error("Parse error:", err);
            return;
        }

        alert("QR Scanned: " + decodeText);

        fetch("/mark-employee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(qrData),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                console.log("📨 Server response:", data);

                if (res.ok) {
                    alert("✅ Attendance marked successfully!");
                } else {
                    alert("❌ Server error: " + (data.message || res.status));
                }
            })
            .catch((err) => {
                console.error("💥 Fetch failed:", err);
                alert("⚠️ Could not reach server!");
            });
    }

    const htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
        fps: 10,
        qrbox: function (viewfinderWidth, viewfinderHeight) {
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let qrboxSize = Math.floor(minEdge * 0.75);
            return { width: qrboxSize, height: qrboxSize };
        },
    });

    htmlscanner.render(onScanSuccess);
});
