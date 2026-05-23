const { MODEL_URL } = window.FACE_API_CONFIG;

document.addEventListener("DOMContentLoaded", () => {
    async function loadModels() {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        console.log("Models loaded");
    }

    window.faceModelsReady = loadModels().catch((error) => {
        console.error("Model loading failed:", error);
        throw error;
    });
})