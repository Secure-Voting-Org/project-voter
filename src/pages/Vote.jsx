import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../utils/auth';

const Vote = () => {
    const navigate = useNavigate();
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

        const currentUser = Auth.getUser();
        setUser(currentUser);

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

    const handleVote = () => {
        if (!selectedCandidateId) return;

        const candidate = candidates.find(c => c.id === selectedCandidateId);

        if (window.confirm(`CONFIRM VOTE:\n\nYou are about to cast your vote for:\n\n${candidate.name}\n${candidate.party}\n\nThis action cannot be undone.`)) {
            setIsVoting(true);

            // Simulate API Call
            setTimeout(() => {
                alert("Vote Cast Successfully!\nTransaction ID: 0x" + Math.random().toString(16).substr(2, 8));
                Auth.logout();
                navigate('/');
            }, 2000);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Ballot...</div>;
    if (!user) return null;

    return (
        <main>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Official Ballot Paper 2026</h2>
                <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Voter: {user.name} | Constituency: {user.constituency}
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
                        onClick={handleVote}
                    >
                        {isVoting ? 'Encrypting Vote...' : (selectedCandidateId ? `Vote for ${candidates.find(c => c.id === selectedCandidateId)?.name}` : 'Confirm & Cast Vote')}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Vote;
