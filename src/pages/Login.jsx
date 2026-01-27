import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import { Auth } from '../utils/auth';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Voter ID, 2: Face Auth
    const [voterId, setVoterId] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleIdSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        // Simulate network delay
        setTimeout(() => {
            const user = Auth.verifyVoterId(voterId.toUpperCase());
            if (user) {
                setCurrentUser({ id: voterId.toUpperCase(), ...user });
                setStep(2);
                setStatusMsg(`Welcome, ${user.name}. Please scan your face.`);
            } else {
                setError("Invalid Voter ID. Please try again.");
            }
            setIsVerifying(false);
        }, 800);
    };

    const handleScanSuccess = () => {
        setStatusMsg("Authentication Successful! Redirecting...");
        Auth.login(currentUser);
        setTimeout(() => {
            navigate('/'); // Redirect to home or Vote page. Logic in original was index.html which might resolve to /
        }, 1500);
    };

    const handleScanFailure = (err) => {
        setStatusMsg("Authentication Failed: " + err.message);
    };

    return (
        <main>
            <div className="auth-container">
                <h2>Voter Authentication</h2>
                <div id="login-steps">
                    {step === 1 && (
                        <div id="step-id">
                            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Step 1/2: Enter Voter ID</p>
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
                                    {isVerifying ? 'Verifying...' : 'Verify Identity'}
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
                        <div id="step-face">
                            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Step 2/2: Biometric Verification</p>

                            <FaceScanner
                                onScanSuccess={handleScanSuccess}
                                onScanFailure={handleScanFailure}
                            />

                        </div>
                    )}

                    {statusMsg && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '1rem',
                            fontWeight: 'bold',
                            color: statusMsg.includes('Success') ? 'var(--success-color)' : (statusMsg.includes('Failed') ? '#dc3545' : 'inherit')
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
