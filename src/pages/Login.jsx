import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import { Auth } from '../utils/auth';
import { enrollFace } from '../services/faceAuth';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(1); // 1: ID, 2: Enroll (if needed), 3: Verify
    const [voterId, setVoterId] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const hasValidFaceData = (user) => {
        return user.faceDescriptor &&
            Array.isArray(user.faceDescriptor) &&
            user.faceDescriptor.length === 128 &&
            user.faceDescriptor[0] !== 0.1; // Check against dummy data
    };

    const handleIdSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        try {
            const user = await Auth.verifyVoterId(voterId.toUpperCase());
            if (user) {
                setCurrentUser({ id: voterId.toUpperCase(), ...user });

                // DECISION: Enroll or Verify?
                if (hasValidFaceData(user)) {
                    setStep(3); // Go straight to Verify
                    setStatusMsg(`Welcome back, ${user.name}. Please verify your identity.`);
                } else {
                    setStep(2); // Go to Enroll
                    setStatusMsg(`Welcome, ${user.name}. First time setup: Please scan your face to register.`);
                }
            } else {
                setError("Invalid Voter ID. Please try again.");
            }
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Step 2: Handle Enrollment
    const handleEnrollment = async (descriptor) => {
        try {
            setStatusMsg("Registering face data...");
            await enrollFace(currentUser.id, descriptor);

            // Update local user data
            const updatedUser = { ...currentUser, faceDescriptor: descriptor };
            setCurrentUser(updatedUser);

            setStatusMsg("Registration Successful! Now verifying identity...");

            // Artificial delay to let user read message before switching context
            setTimeout(() => {
                setStep(3); // Move to Verify
            }, 2000);

        } catch (err) {
            setStatusMsg("Registration Failed: " + err.message);
        }
    };

    // Step 3: Handle Verification
    const handleVerificationSuccess = async () => {
        setStatusMsg(`${t('login.success')} Logging in...`);
        await Auth.login(currentUser);
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
                            </form>
                            {error && (
                                <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div id="step-enroll">
                            <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                                <strong>Registration Required</strong>
                            </p>
                            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                We need to capture your face data for future verification.
                                <br />Please look at the camera.
                            </p>

                            <FaceScanner
                                mode="enroll"
                                onEnroll={handleEnrollment}
                                onScanFailure={handleScanFailure}
                            />
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

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setStep(2)}
                                >
                                    Issues? Re-Register Face
                                </button>
                            </div>
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
