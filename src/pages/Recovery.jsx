import React, { useState, useRef, useEffect } from 'react';
import { Auth } from '../utils/auth';
import { Link } from 'react-router-dom';
import { Scan, ShieldCheck, CreditCard, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';

export default function Recovery() {
    const [step, setStep] = useState(1); // 1: ID, 2: Combined Auth, 3: Success
    const [voterId, setVoterId] = useState('');
    const [requestId, setRequestId] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [scanStage, setScanStage] = useState('idle'); // idle, nfc, face, success
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const videoRef = useRef(null);

    // Initialize Camera on Step 2
    useEffect(() => {
        if (step === 2) {
            startCamera();
        }
        return () => stopCamera();
    }, [step]);

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => console.error("Camera error:", err));
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
    };

    // Step 1: Initiate Request
    const handleInitiate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${Auth.API_URL}/recovery/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voterId })
            });
            const data = await res.json();
            if (res.ok) {
                setRequestId(data.requestId);
                setStep(2); // Jump straight to Unified Auth
            } else {
                setError(data.error || 'Failed to initiate');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Unified Verification Flow (NFC -> Face)
    const startUnifiedVerification = async () => {
        if (scanStage !== 'idle') return;

        setError('');

        // 1. NFC Check
        setScanStage('nfc');
        setStatusText('Scanning NFC Token...');

        try {
            // Simulate NFC Tap delay
            await new Promise(r => setTimeout(r, 2000));

            const nfcRes = await fetch(`${Auth.API_URL}/recovery/verify-nfc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });

            if (!nfcRes.ok) throw new Error('NFC Token not detected or invalid.');

            // 2. Face Check (Auto-transition)
            setScanStage('face');
            setStatusText('Verifying Face Match...');

            // Simulate Face Analysis delay
            await new Promise(r => setTimeout(r, 2500));

            const mockDescriptor = Array(128).fill(0.1);
            const faceRes = await fetch(`${Auth.API_URL}/recovery/verify-face`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, faceDescriptor: mockDescriptor })
            });

            if (!faceRes.ok) throw new Error('Face verification failed.');

            // Success!
            setScanStage('success');
            setTimeout(() => setStep(3), 1000);

        } catch (err) {
            setError(err.message || 'Verification failed. Try again.');
            setScanStage('idle');
        }
    };

    return (
        <main>
            <div className="auth-container">
                <style>{`
                    .scan-overlay {
                        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.3);
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        border-radius: 8px;
                    }
                    .scan-line {
                        width: 100%; height: 2px; background: #00ff00;
                        position: absolute; top: 0; box-shadow: 0 0 10px #00ff00;
                        animation: scan 2s infinite linear;
                        opacity: 0.6;
                    }
                    @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
                    @keyframes pulse-ring {
                        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(247, 148, 29, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(247, 148, 29, 0); }
                        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(247, 148, 29, 0); }
                    }
                `}</style>

                <h2 style={{ marginBottom: step === 1 ? '2rem' : '1rem' }}>Secure Account Recovery</h2>

                {error && (
                    <div style={{
                        background: '#ffebee', color: '#c62828', padding: '12px',
                        borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center',
                        fontSize: '0.9rem', border: '1px solid #ffcdd2', fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                {/* STEP 1: ID INPUT */}
                {step === 1 && (
                    <form onSubmit={handleInitiate}>
                        <div className="form-group">
                            <label style={{ color: 'var(--primary-color)' }}>Voter Identification</label>
                            <input
                                type="text"
                                value={voterId}
                                onChange={(e) => setVoterId(e.target.value)}
                                placeholder="Enter your Voter ID"
                                required
                                style={{ padding: '12px', fontSize: '1rem', border: '2px solid #e0e0e0' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader2 className="spin" size={20} /> : 'Proceed to Security Check'} <ChevronRight size={18} />
                        </button>
                    </form>
                )}

                {/* STEP 2: UNIFIED AUTH UI */}
                {step === 2 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            position: 'relative', width: '280px', height: '280px',
                            margin: '0 auto 1.5rem', background: '#000', borderRadius: '16px',
                            overflow: 'hidden', border: '4px solid var(--primary-color)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}>
                            {/* Camera Feed */}
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                            />

                            {/* Dynamic Overlays */}
                            {scanStage === 'idle' && (
                                <div className="scan-overlay">
                                    <ShieldCheck size={64} color="white" style={{ opacity: 0.8 }} />
                                    <p style={{ color: 'white', marginTop: '1rem', fontWeight: '500' }}>Ready to Verify</p>
                                </div>
                            )}

                            {scanStage === 'nfc' && (
                                <div className="scan-overlay" style={{ background: 'rgba(25, 39, 66, 0.8)' }}>
                                    <div style={{
                                        width: '80px', height: '80px', background: 'white',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        animation: 'pulse-ring 2s infinite'
                                    }}>
                                        <CreditCard size={40} color="var(--accent-color)" />
                                    </div>
                                    <p style={{ color: 'white', marginTop: '1.5rem', fontWeight: 'bold' }}>Scanning Token...</p>
                                </div>
                            )}

                            {scanStage === 'face' && (
                                <>
                                    <div className="scan-line"></div>
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <Scan size={24} color="#00ff00" />
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '0', left: '0', right: '0',
                                        background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px', fontSize: '0.8rem'
                                    }}>
                                        Analyzing Biometrics...
                                    </div>
                                </>
                            )}

                            {scanStage === 'success' && (
                                <div className="scan-overlay" style={{ background: 'rgba(19, 136, 8, 0.9)' }}>
                                    <CheckCircle size={80} color="white" />
                                </div>
                            )}
                        </div>

                        {/* Status & Instructions */}
                        <div style={{ minHeight: '60px' }}>
                            {scanStage === 'idle' ? (
                                <p style={{ color: '#666' }}>
                                    Please hold your <strong>NFC Token</strong> near the device and look directly at the camera.
                                </p>
                            ) : (
                                <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                    {statusText}
                                </p>
                            )}
                        </div>

                        {scanStage === 'idle' && (
                            <button
                                onClick={startUnifiedVerification}
                                className="btn"
                                style={{
                                    marginTop: '1rem', background: 'var(--accent-color)', color: 'white',
                                    padding: '1rem', fontSize: '1.1rem'
                                }}
                            >
                                Start Secure Verification
                            </button>
                        )}
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'var(--success-color)',
                            borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(19, 136, 8, 0.3)'
                        }}>
                            <CheckCircle size={48} color="white" />
                        </div>
                        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Verification Complete</h3>
                        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Your identity has been confirmed. The Admin has been notified to unlock your account immediately.
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Return to Login
                        </Link>
                    </div>
                )}

                {/* Progress Dots */}
                {step < 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2.5rem' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                height: '8px', width: '8px', borderRadius: '50%',
                                backgroundColor: step >= s ? 'var(--primary-color)' : '#e0e0e0',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
