// 1. Create a variable outside the scope to track the active scanner
let currentScanner = null;

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
    console.log("✅ DOM Ready, initializing QR logic...");

    function onScanSuccess(decodeText) {
        console.log("📸 QR detected:", decodeText);

        // --- PAUSE SCANNING IMMEDIATELY ON SUCCESS ---
        // This prevents the camera from reading the same code 10 times in a row
        if (currentScanner) {
            currentScanner.pause(); 
        }

        let qrData;
        try {
            qrData = JSON.parse(decodeText);
        } catch (err) {
            alert("⚠️ Invalid QR code format!");
            console.error("Parse error:", err);
            // If failed, resume scanning so they can try again
            if(currentScanner) currentScanner.resume();
            return;
        }

        // alert("QR Scanned: " + decodeText); // Optional: Commented out to be less annoying

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
                    // OPTIONAL: Clear the scanner entirely after success
                    // if (currentScanner) currentScanner.clear(); 
                } else {
                    alert("❌ Server error: " + (data.message || res.status));
                    // Resume scanning if server failed
                    if(currentScanner) currentScanner.resume();
                }
            })
            .catch((err) => {
                console.error("💥 Fetch failed:", err);
                alert("⚠️ Could not reach server!");
                 // Resume scanning if fetch failed
                 if(currentScanner) currentScanner.resume();
            });
    }

    // --- CLEANUP LOGIC ---
    // If a scanner already exists from a previous session, clear it first.
    if (currentScanner) {
        console.log("🧹 Cleaning up old scanner instance...");
        currentScanner.clear().catch(error => {
            console.error("Failed to clear old scanner", error);
        }).then(() => {
            // Once cleared, nullify and re-init
            currentScanner = null;
            startScanner();
        });
    } else {
        // If no scanner exists, just start
        startScanner();
    }

    function startScanner() {
        // Double check the element exists to prevent errors
        const container = document.getElementById("my-qr-reader");
        if (!container) {
            console.error("❌ Error: Element 'my-qr-reader' not found in DOM.");
            return;
        }
        
        // Use .innerHTML = "" to brute-force clear any leftover DOM junk from a crashed scanner
        container.innerHTML = ""; 

        const htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
            fps: 10,
            qrbox: function (viewfinderWidth, viewfinderHeight) {
                let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                let qrboxSize = Math.floor(minEdge * 0.75);
                return { width: qrboxSize, height: qrboxSize };
            },
            // REMEMBER SESSION: false prevents it from trying to auto-resume broken sessions
            rememberLastUsedCamera: false 
        });

        // Update the global reference
        currentScanner = htmlscanner;

        htmlscanner.render(onScanSuccess);
    }
});