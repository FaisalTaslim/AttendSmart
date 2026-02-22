document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("live-camera");
    const videoStage = document.querySelector(".video-stage");

    if (!video) {
        console.error("Video element not found.");
        return;
    }

    let detectionInterval;
    let detectionCanvas;

    // Keep track of employees already marked for this session
    const markedEmployees = new Set();

    // Load stored employee face descriptors from backend
    async function fetchEmployeeDescriptors() {
        try {
            const res = await fetch("/dashboard/employee/face-data");
            const contentType = res.headers.get("content-type") || "";

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 200)}`);
            }

            if (!contentType.includes("application/json")) {
                const bodyText = await res.text();
                throw new Error(`Expected JSON, received ${contentType || "unknown"}: ${bodyText.slice(0, 200)}`);
            }

            const data = await res.json();

            // Convert descriptors array to Float32Array for face-api
            return data.map(emp => ({
                code: emp.code,
                name: emp.name,
                descriptors: emp.faceData.descriptors.map(d => new Float32Array(d))
            }));
        } catch (err) {
            console.error("Failed to fetch employee descriptors:", err);
            return [];
        }
    }

    let labeledDescriptors = [];

    fetchEmployeeDescriptors().then(data => {
        labeledDescriptors = data.map(emp =>
            new faceapi.LabeledFaceDescriptors(emp.code, emp.descriptors)
        );
        console.log("Employee descriptors loaded:", labeledDescriptors.length);
    });

    video.addEventListener("play", async () => {
        try {
            if (window.faceModelsReady) {
                await window.faceModelsReady;
            }

            if (!labeledDescriptors.length) {
                const data = await fetchEmployeeDescriptors();
                labeledDescriptors = data.map(emp =>
                    new faceapi.LabeledFaceDescriptors(emp.code, emp.descriptors)
                );
            }

            if (!labeledDescriptors.length) {
                console.warn("No employee descriptors found for recognition.");
                return;
            }

            if (detectionInterval) {
                clearInterval(detectionInterval);
                detectionInterval = null;
            }

            if (detectionCanvas) {
                detectionCanvas.remove();
            }

            detectionCanvas = faceapi.createCanvasFromMedia(video);
            videoStage.append(detectionCanvas);

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(detectionCanvas, displaySize);
            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

            detectionInterval = setInterval(async () => {
                try {
                    const detections = await faceapi
                        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    const context = detectionCanvas.getContext("2d");
                    context.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
                    faceapi.draw.drawDetections(detectionCanvas, resizedDetections);

                    resizedDetections.forEach(detection => {
                        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

                        if (bestMatch.label !== "unknown" && !markedEmployees.has(bestMatch.label)) {
                            markedEmployees.add(bestMatch.label);

                            fetch("/dashboard/employee/increment-attendance", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ code: bestMatch.label })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) {
                                        console.log(`Attendance marked for employee: ${bestMatch.label}`);
                                        return;
                                    }

                                    console.error(`Failed to mark attendance for ${bestMatch.label}:`, data.error || data.message);
                                    markedEmployees.delete(bestMatch.label);
                                })
                                .catch(err => {
                                    console.error("Error marking attendance:", err);
                                    markedEmployees.delete(bestMatch.label);
                                });
                        }

                        const box = detection.detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
                        drawBox.draw(detectionCanvas);
                    });
                } catch (error) {
                    console.error("Detection loop failed:", error);
                }
            }, 500);
        } catch (error) {
            console.error("Failed to start live face detection:", error);
        }
    });

    video.addEventListener("pause", () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
    });

    video.addEventListener("ended", () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
    });
});
