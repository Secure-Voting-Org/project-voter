import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import useInactivityTimer from '../hooks/useInactivityTimer';
import ConfirmationModal from '../components/ConfirmationModal';
import EncryptionWorker from '../workers/encryption.worker?worker'; // Vite Worker Import

const Vote = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { logout } = useAuth(); // Get logout function from context
    const [user, setUser] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [publicKey, setPublicKey] = useState(null);
    const [voteError, setVoteError] = useState(null); // Module 5.1 — phase-aware error display

    // Inactivity Timeout Handler
    const handleTimeout = () => {
        console.log("User inactive. Logging out.");

        // 1. Clear Session Keys
        sessionStorage.removeItem('election_public_key');

        // 2. Logout User (clears localStorage and Context)
        logout();

        // 3. Redirect to Home
        navigate('/');
    };

    // Initialize 2-minute inactivity timer
    useInactivityTimer(120000, handleTimeout);

    useEffect(() => {
        if (!Auth.isAuthenticated()) {
            navigate('/login');
            return;
        }

        const currentUser = Auth.getUser();
        setUser(currentUser);

        // Fetch Election Public Key
        const fetchPublicKey = async () => {
            const cached = sessionStorage.getItem('election_public_key');
            if (cached) {
                setPublicKey(JSON.parse(cached));
                return;
            }

            try {
                const fetchUrl = `${Auth.API_URL}/api/election/public-key`;
                const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/election/public-key` : fetchUrl;
                const response = await fetch(urlToUse);
                if (response.ok) {
                    const data = await response.json();
                    setPublicKey(data);
                    sessionStorage.setItem('election_public_key', JSON.stringify(data));
                } else {
                    console.error("Failed to fetch election key");
                }
            } catch (error) {
                console.error("Network error fetching key:", error);
            }
        };
        fetchPublicKey();

        // Fetch Candidates based on Constituency
        if (currentUser && currentUser.constituency) {
            const fetchCandidates = async () => {
                try {
                    const fetchUrl = `${Auth.API_URL}/api/candidates?constituency=${encodeURIComponent(currentUser.constituency)}`;
                    const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/candidates?constituency=${encodeURIComponent(currentUser.constituency)}` : fetchUrl;
                    const response = await fetch(urlToUse);
                    if (response.ok) {
                        const data = await response.json();
                        setCandidates(data);
                    } else {
                        console.error("Failed to fetch candidates");
                    }
                } catch (error) {
                    console.error("Network error:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCandidates();
        } else {
            setLoading(false);
        }
    }, [navigate]);

    const handleVoteClick = () => {
        if (!selectedCandidateId) return;
        setShowModal(true);
    };

    const confirmVote = async () => {
        if (!publicKey) {
            alert("Election system not ready (Missing Public Key). Please try again later.");
            return;
        }

        setIsVoting(true);
        setShowModal(false);
        setVoteError(null);

        // Module 5.1 — Check election phase FIRST before any network calls
        try {
            const fetchUrl = `${Auth.API_URL}/api/election/status`;
            const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/election/status` : fetchUrl;
            const phaseRes = await fetch(urlToUse);
            if (phaseRes.ok) {
                const phaseData = await phaseRes.json();
                if (phaseData.phase === 'PRE_POLL') {
                    setVoteError({ icon: '🕐', title: 'Voting Has Not Started Yet', body: 'The election has not begun. Please check back later.' });
                    setIsVoting(false);
                    return;
                }
                if (phaseData.phase === 'POST_POLL') {
                    setVoteError({ icon: '🔒', title: 'Voting Has Closed', body: 'The election has ended. Thank you for your participation.' });
                    setIsVoting(false);
                    return;
                }
                if (phaseData.is_kill_switch_active) {
                    setVoteError({ icon: '⚠️', title: 'Voting Temporarily Suspended', body: 'The election has been paused by the administrator. Please try again later.' });
                    setIsVoting(false);
                    return;
                }
            }
        } catch {
            // If phase check fails, let the existing backend middleware handle it
        }

        try {
            // 1. Encrypt Vote in Background Worker
            const worker = new EncryptionWorker();

            console.log("Starting encryption for vector vote. Selected:", selectedCandidateId);
            const candidateIds = candidates.map(c => c.id);
            const { encryptedVote, rangeProof } = await new Promise((resolve, reject) => {

                worker.postMessage({
                    candidateIds: candidateIds,
                    selectedCandidateId: selectedCandidateId,
                    publicKeyData: publicKey
                });

                worker.onmessage = (e) => {
                    if (e.data.success) {
                        // Module 4.7: receive rangeProof alongside the ciphertext
                        resolve({ encryptedVote: e.data.encryptedVote, rangeProof: e.data.rangeProof });
                    } else {
                        reject(new Error(e.data.error));
                    }
                    worker.terminate();
                };

                worker.onerror = (err) => {
                    reject(err);
                    worker.terminate();
                };
            });

            console.log("Vote Encrypted:", encryptedVote);

            // --- BLIND SIGNATURE FLOW ---

            // 1a. Fetch Blind Signature Keys
            const keysUrl = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/blind-signature/keys` : `${Auth.API_URL}/api/blind-signature/keys`;
            const keyRes = await fetch(keysUrl);
            if (!keyRes.ok) throw new Error("Failed to fetch blind signature keys");
            const keys = await keyRes.json(); // { n, e }

            // 1b. Generate Token & Blind It
            const BlindSignature = (await import('../utils/BlindSignature')).default;
            const token = BlindSignature.generateToken();
            const { blinded, r } = BlindSignature.blind(token, keys.e, keys.n);

            console.log("Blinded Token Generated for Signing");

            // 1c. Rest Blind Signature from Authority
            const signUrl = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/blind-sign` : `${Auth.API_URL}/api/blind-sign`;
            const signRes = await fetch(signUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blinded_token: blinded,
                    voterId: user.id
                })
            });

            if (!signRes.ok) throw new Error("Failed to obtain blind signature. You may have already voted.");
            const signData = await signRes.json();

            // 1d. Unblind the Signature
            const unblindedSignature = BlindSignature.unblind(signData.signature, r, keys.n);
            console.log("Signature Unblinded Successfully");

            // 2. Submit Encrypted Vote (Anonymous)
            const voteUrl = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/vote` : `${Auth.API_URL}/api/vote`;
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vote: encryptedVote,       // Ciphertext
                    auth_token: token,          // original Token (Message)
                    signature: unblindedSignature, // Valid Signature
                    constituency: user.constituency,
                    range_proof: rangeProof,    // Module 4.7: ZK Range Proof
                    voterId: user.id,            // ← pass so backend marks token after commit
                })
            });

            if (response.ok) {
                const data = await response.json();
                navigate('/vote-success', { state: { transactionHash: data.transactionHash } });
            } else {
                const err = await response.json();
                const msg = err.error || 'Unknown Error';
                // Module 5.1 — show phase-specific styled messages instead of raw alert
                if (msg === 'Election Not Started') {
                    setVoteError({ icon: '🕐', title: 'Voting Has Not Started Yet', body: 'The election has not begun. Please check back later.' });
                } else if (msg === 'Election Has Ended') {
                    setVoteError({ icon: '🔒', title: 'Voting Has Closed', body: 'The election has ended. Thank you for your participation.' });
                } else if (msg.includes('suspended')) {
                    setVoteError({ icon: '⚠️', title: 'Voting Temporarily Suspended', body: 'The election has been paused by the administrator. Please try again later.' });
                } else {
                    setVoteError({ icon: '❌', title: 'Voting Failed', body: msg });
                }
                setIsVoting(false);
            }
        } catch (error) {
            console.error("Voting error", error);
            setVoteError({ icon: '❌', title: 'Voting Error', body: error.message });
            setIsVoting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>{t('vote.loading')}</div>;
    if (!user) return null;

    return (
        <main>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('vote.title')}</h2>
                <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Voter: {user.name} | {t('vote.constituency')}: {user.constituency}
                </div>
                <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
                    Please select one candidate from the list below. Your vote is encrypted and anonymous.
                </p>

                {/* Module 5.1 — Phase-aware error banner */}
                {voteError && (
                    <div style={{
                        background: '#FFF3CD',
                        border: '1px solid #FFC107',
                        borderRadius: '10px',
                        padding: '1.5rem 2rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{voteError.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#856404' }}>{voteError.title}</div>
                        <div style={{ color: '#6D5206', fontSize: '0.9rem' }}>{voteError.body}</div>
                        <button onClick={() => setVoteError(null)} style={{
                            marginTop: '1rem',
                            background: 'none',
                            border: '1px solid #856404',
                            borderRadius: '6px',
                            padding: '0.3rem 1rem',
                            cursor: 'pointer',
                            color: '#856404',
                            fontWeight: 600
                        }}>Dismiss</button>
                    </div>
                )}

                {candidates.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'red' }}>No candidates found for this constituency.</div>
                ) : (
                    <div className="candidate-grid">
                        {candidates.map(c => (
                            <div
                                key={c.id}
                                className={`candidate-card ${selectedCandidateId === c.id ? 'selected' : ''}`}
                                onClick={() => setSelectedCandidateId(c.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="candidate-icon" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                                    {c.symbol}
                                </div>
                                <h3>{c.name}</h3>
                                <p className="party-name">{c.party}</p>
                                <div className="selection-indicator"></div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button
                        id="main-vote-button"
                        className="btn btn-primary"
                        style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: selectedCandidateId ? 'var(--primary-color)' : '#ccc' }}
                        disabled={!selectedCandidateId || isVoting}
                        onClick={handleVoteClick}
                    >
                        {isVoting ? 'Encrypting...' : t('vote.cast_vote')}
                    </button>
                </div>

                <ConfirmationModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={confirmVote}
                    candidate={candidates.find(c => c.id === selectedCandidateId)}
                />
            </div>
        </main>
    );
};

export default Vote;
