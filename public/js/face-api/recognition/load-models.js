document.addEventListener("DOMContentLoaded", () => {
    async function loadModels() {
        const MODEL_URL = "/models";

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
