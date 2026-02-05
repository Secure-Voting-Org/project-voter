import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import BallotLoader from '../components/BallotLoader';

const Vote = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!Auth.isAuthenticated()) {
            navigate('/login');
            return;
        }
        setUser(Auth.getUser());
    }, [navigate]);

    const handleCandidatesLoad = useCallback((data) => {
        setCandidates(data);
        setLoading(false);
    }, []);

    const handleVote = async () => {
        if (!selectedCandidateId) return;

        const candidate = candidates.find(c => c.id === selectedCandidateId);

        if (window.confirm(`CONFIRM VOTE:\n\nYou are about to cast your vote for:\n\n${candidate.name}\n${candidate.party}\n\nThis action cannot be undone.`)) {
            setIsVoting(true);

            try {
                const response = await fetch(`${Auth.API_URL}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        voterId: user.id,
                        candidateId: selectedCandidateId,
                        constituency: user.constituency
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`${t('vote.success_alert')}\n\nBlockchain Transaction Hash:\n` + data.transactionHash);
                    Auth.logout();
                    navigate('/');
                } else {
                    const err = await response.json();
                    alert("Voting Failed: " + (err.error || "Unknown Error"));
                    setIsVoting(false);
                }
            } catch (error) {
                console.error("Voting error", error);
                alert("Network Error: Could not cast vote.");
                setIsVoting(false);
            }
        }
    };

    if (!user) return null;

    return (
        <main>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('vote.title')}</h2>
                <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Voter: {user.name} | {t('vote.constituency')}: {user.constituency}
                </div>

                <BallotLoader
                    voterId={user.id}
                    onCandidatesLoad={handleCandidatesLoad}
                    t={t}
                />

                {candidates.length > 0 && (
                    <>
                        <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
                            Please select one candidate from the list below. Your vote is encrypted and anonymous.
                        </p>

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

                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: selectedCandidateId ? 'var(--primary-color)' : '#ccc' }}
                                disabled={!selectedCandidateId || isVoting}
                                onClick={handleVote}
                            >
                                {isVoting ? 'Encrypting...' : (selectedCandidateId ? `${t('vote.cast_vote')} for ${candidates.find(c => c.id === selectedCandidateId)?.name}` : t('vote.cast_vote'))}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default Vote;
