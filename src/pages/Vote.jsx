import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '../components/ConfirmationModal';
import EncryptionWorker from '../workers/encryption.worker?worker'; // Vite Worker Import

const Vote = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [publicKey, setPublicKey] = useState(null);

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
                const response = await fetch(`${Auth.API_URL}/election/public-key`);
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
                    const response = await fetch(`${Auth.API_URL}/candidates?constituency=${encodeURIComponent(currentUser.constituency)}`);
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

        try {
            // 1. Encrypt Vote in Background Worker
            const worker = new EncryptionWorker();

            console.log("Starting encryption with candidateId:", selectedCandidateId);
            const encryptedVote = await new Promise((resolve, reject) => {
                worker.postMessage({
                    candidateId: selectedCandidateId,
                    publicKeyData: publicKey
                });

                worker.onmessage = (e) => {
                    if (e.data.success) {
                        resolve(e.data.encryptedVote);
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
            const keyRes = await fetch(`${Auth.API_URL}/blind-signature/keys`);
            if (!keyRes.ok) throw new Error("Failed to fetch blind signature keys");
            const keys = await keyRes.json(); // { n, e }

            // 1b. Generate Token & Blind It
            const BlindSignature = (await import('../utils/BlindSignature')).default;
            const token = BlindSignature.generateToken();
            const { blinded, r } = BlindSignature.blind(token, keys.e, keys.n);

            console.log("Blinded Token Generated for Signing");

            // 1c. Rest Blind Signature from Authority
            const signRes = await fetch(`${Auth.API_URL}/blind-sign`, {
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
            const response = await fetch(`${Auth.API_URL}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vote: encryptedVote, // Ciphertext
                    auth_token: token,   // original Token (Message)
                    signature: unblindedSignature, // Valid Signature
                    constituency: user.constituency
                })
            });

            if (response.ok) {
                const data = await response.json();
                navigate('/vote-success', { state: { transactionHash: data.transactionHash } });
            } else {
                const err = await response.json();
                alert("Voting Failed: " + (err.error || "Unknown Error"));
                setIsVoting(false);
            }
        } catch (error) {
            console.error("Voting error", error);
            alert("Error: " + error.message);
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
