
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels, getFaceDescriptor, matchFaces } from '../services/faceAuth';

const FaceScanner = ({ onScanSuccess, onScanFailure, currentUser, onEnroll, mode = 'verify' }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [status, setStatus] = useState('Initializing Face ID...');

    useEffect(() => {
        const startFaceAuth = async () => {
            try {
                await loadModels();
                setIsModelLoaded(true);
                setStatus('Models loaded. Starting camera...');
                startVideo();
            } catch (err) {
                console.error(err);
                if (onScanFailure) onScanFailure(new Error('Failed to load AI models'));
            }
        };
        startFaceAuth();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error(err);
                setStatus('Error accessing camera');
                if (onScanFailure) onScanFailure(err);
            });
    };

    const handleVideoPlay = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setStatus(mode === 'enroll' ? 'Scanning face for registration...' : 'Verifying identity...');

        const interval = setInterval(async () => {
            if (!videoRef.current) {
                clearInterval(interval);
                return;
            }

            try {
                // Detect face
                const detections = await faceapi.detectSingleFace(video)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detections) {
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    // Clear previous drawings
                    const context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw box
                    faceapi.draw.drawDetections(canvas, resizedDetections);

                    // LOGIC BASED ON MODE
                    if (mode === 'enroll') {
                        // ENROLL MODE: Capture first good face
                        setStatus('Face Captured! Registering...');
                        clearInterval(interval);
                        video.srcObject.getTracks().forEach(track => track.stop());

                        if (onEnroll) onEnroll(detections.descriptor);

                    } else {
                        // VERIFY MODE
                        if (currentUser && currentUser.faceDescriptor) {
                            const match = matchFaces(detections.descriptor, currentUser.faceDescriptor);
                            if (match) {
                                setStatus('Face Verified!');
                                clearInterval(interval);
                                video.srcObject.getTracks().forEach(track => track.stop());
                                if (onScanSuccess) onScanSuccess();
                            } else {
                                setStatus('Face Does Not Match Records');
                            }
                        } else {
                            setStatus('Error: No reference data for verification.');
                        }
                    }
                }
            } catch (error) {
                console.error("Detection error:", error);
            }
        }, 500);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{status}</p>
            <div style={{ position: 'relative' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    onPlay={handleVideoPlay}
                    width="480"
                    height="360"
                    style={{ borderRadius: '8px', width: '100%' }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                />
            </div>
        </div>
    );
};

export default FaceScanner;

