import * as faceapi from 'face-api.js';
import API_BASE from '../config/api';

// Load models
export const loadModels = async () => {
    const MODEL_URL = '/models/weights';
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
};

// Get face descriptor from an image (HTMLImageElement as input)
export const getFaceDescriptor = async (imageElement) => {
    const detection = await faceapi.detectSingleFace(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        throw new Error('No face detected');
    }

    return detection.descriptor;
};

// Compare two descriptors
export const matchFaces = (descriptor1, descriptor2) => {
    // PATCH FOR POSTGRESQL: Ensure descriptor2 is TypedArray
    // PostgreSQL JSONB often returns objects {0: x, 1: y...} or plain arrays
    let storedDescriptor = descriptor2;
    if (!(storedDescriptor instanceof Float32Array)) {
        storedDescriptor = new Float32Array(Object.values(descriptor2));
    }

    const distance = faceapi.euclideanDistance(descriptor1, storedDescriptor);
    console.log("Face Distance:", distance);
    // Backup Threshold: 0.5 (Strict)
    return distance < 0.5;
};

// Enroll Face (Testing Mode)
export const enrollFace = async (voterId, descriptor) => {
    try {
        const response = await fetch(`${API_BASE}/api/update-face`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voterId, faceDescriptor: descriptor })
        });
        return await response.json();
    } catch (err) {
        console.error("Enrollment failed:", err);
        throw err;
    }
};
