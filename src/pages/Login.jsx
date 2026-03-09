import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import { Auth } from '../utils/auth';
import { enrollFace } from '../services/faceAuth';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNFC } from '../hooks/useNFC';
import { Wifi, XCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login: contextLogin } = useAuth();
    const [step, setStep] = useState(1); // 1: ID, 3: Verify (Step 2 Enrollment removed)
    const [voterId, setVoterId] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    // NFC Hook
    const { scan, stop: stopNFC, isReading, error: nfcError } = useNFC();
    const [showNFCModal, setShowNFCModal] = useState(false);

    const hasValidFaceData = (user) => {
        return user.faceDescriptor &&
            Array.isArray(user.faceDescriptor) &&
            user.faceDescriptor.length === 128 &&
            user.faceDescriptor[0] !== 0.1; // Check against dummy data
    };

    const handleNFCLogin = () => {
        setShowNFCModal(true);
        setError('');
        scan((data) => {
            console.log("Login Page - NFC Data Received:", data);

            // Support both internal ID and hardware Serial Number (UID)
            const scannedId = data.id || data.serialNumber;

            if (scannedId) {
                // If we have encrypted data, pass the whole object
                // Otherwise just pass the ID string
                const payload = data.encryptedData ? data : scannedId;

                setVoterId(scannedId);
                stopNFC();
                setShowNFCModal(false);
                // Trigger auto-submit logic
                verifyVoterId(payload);
            } else {
                console.error("NFC Error: No ID found in tag data", data);
                setError(`Tag detected but no ID found. Serial: '${data.serialNumber || 'N/A'}'`);
            }
        });
    };

    const simulateNFCLogin = () => {
        const mockID = window.prompt("Enter the Voter ID / NFC String to simulate:", "dd:e9:1d:f3");
        if (mockID) {
            setVoterId(mockID.trim());
            setShowNFCModal(false);
            verifyVoterId(mockID.trim());
        }
    };

    // Refactored verification logic to be reusable
    const verifyVoterId = async (id) => {
        setError('');
        setIsVerifying(true);
        setStatusMsg("Verifying ID...");

        try {
            const user = await Auth.verifyVoterId(id);
            if (user) {
                if (hasValidFaceData(user)) {
                    setCurrentUser({ id: id, ...user });
                    setStep(3); // Go straight to Verify
                    setStatusMsg(`Welcome back, ${user.name}. Please verify your identity.`);
                } else {
                    setError("Biometric data not found. Please visit a polling officer for registration.");
                    setStatusMsg('');
                }
            } else {
                setError("Invalid Voter ID. Please try again.");
                setStatusMsg('');
            }
        } catch (err) {
            setError("Server connection failed.");
            setStatusMsg('');
        } finally {
            setIsVerifying(false);
        }
    };


    const handleIdSubmit = async (e) => {
        e.preventDefault();
        verifyVoterId(voterId);
    };

    // Step 3: Handle Verification
    const handleVerificationSuccess = async () => {
        setStatusMsg(`${t('login.success')} Logging in...`);
        await contextLogin(currentUser);
        setTimeout(() => {
            navigate('/vote');
        }, 1500);
    };

    const handleScanFailure = (err) => {
        setStatusMsg("Scan Error: " + err.message);
    };

    return (
        <main>
            <div className="auth-container">
                <h2>{t('login.title')}</h2>
                <div id="login-steps">
                    {step === 1 && (
                        <div id="step-id">
                            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Step 1: {t('login.id_placeholder')}</p>
                            <form onSubmit={handleIdSubmit}>
                                <div className="form-group">
                                    <label htmlFor="voterIdInput">Voter ID Number</label>
                                    <input
                                        type="text"
                                        id="voterIdInput"
                                        className="form-control"
                                        placeholder="e.g. ABC1234567"
                                        required
                                        autoFocus
                                        value={voterId}
                                        onChange={(e) => setVoterId(e.target.value)}
                                        disabled={isVerifying}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={isVerifying}>
                                    {isVerifying ? t('login.verifying') : t('login.verify_btn')}
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                                    <span style={{ padding: '0 10px', color: '#888', fontSize: '0.9rem' }}>OR</span>
                                    <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                                </div>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleNFCLogin}
                                    style={{ width: '100%', background: '#212121', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Wifi size={18} /> Login with NFC Card
                                </button>
                            </form>

                            {/* NFC Modal Overlay */}
                            {showNFCModal && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{
                                        background: 'white', padding: '2rem', borderRadius: '12px',
                                        width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative'
                                    }}>
                                        <button
                                            onClick={() => { setShowNFCModal(false); stopNFC(); }}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <XCircle size={24} color="#666" />
                                        </button>

                                        <Wifi size={64} style={{ color: '#1a73e8', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }} />

                                        <h3>Ready to Scan</h3>
                                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                                            Hold your Voter ID card near the back of your device.
                                        </p>

                                        {nfcError && (
                                            <div style={{ color: '#dc3545', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                                {nfcError}
                                            </div>
                                        )}

                                        <div style={{ paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                            <button
                                                onClick={simulateNFCLogin}
                                                style={{ background: 'none', border: 'none', color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                (Dev) Simulate Tap
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div id="step-verify">
                            <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--success-color)' }}>
                                <strong>Identity Check</strong>
                            </p>
                            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('login.face_auth')}</p>

                            <FaceScanner
                                mode="verify"
                                currentUser={currentUser}
                                onScanSuccess={handleVerificationSuccess}
                                onScanFailure={handleScanFailure}
                            />
                        </div>
                    )}

                    {statusMsg && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '1rem',
                            fontWeight: 'bold',
                            padding: '10px',
                            borderRadius: '5px',
                            backgroundColor: '#f8f9fa',
                            color: statusMsg.includes('Success') || statusMsg.includes('Verified') ? 'var(--success-color)' : (statusMsg.includes('Failed') ? '#dc3545' : 'inherit')
                        }}>
                            {statusMsg}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Login;
