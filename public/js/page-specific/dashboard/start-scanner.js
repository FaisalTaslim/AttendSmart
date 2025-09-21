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
    const htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } }
    );

    function onScanSuccess(decodedText, decodedResult) {
        let qrData;
        try {
            qrData = JSON.parse(decodedText);
            alert("Parsed JSON: " + JSON.stringify(qrData));
        } catch (e) {
            alert("❌ Invalid QR data! Expected JSON.");
            return;
        }

        fetch("/mark-employee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(qrData)
        })
            .then(res => res.json())
            .then(data => {
                alert("✅ successful Scan: " + JSON.stringify(data));
            })
            .catch(err => alert("⚠️ Error sending to backend: " + err));
    }

    htmlscanner.render(onScanSuccess);
});
