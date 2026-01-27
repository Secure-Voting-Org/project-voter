import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../utils/auth';

const Vote = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    // Mock Candidates Data
    const CANDIDATES = [
        { id: 1, name: "Maria Garcia", party: "Progressive Alliance", symbol: "☀️", color: "#FFD700" },
        { id: 2, name: "David Chen", party: "Tech Forward", symbol: "🚀", color: "#0d6efd" },
        { id: 3, name: "Sarah Johnson", party: "Green Future", symbol: "🌱", color: "#198754" },
        { id: 4, name: "James Wilson", party: "Liberty Union", symbol: "🗽", color: "#6c757d" }
    ];

    useEffect(() => {
        if (!Auth.isAuthenticated()) {
            navigate('/login');
            return;
        }
        setUser(Auth.getUser());
    }, [navigate]);

    const handleVote = () => {
        if (!selectedCandidateId) return;

        const candidate = CANDIDATES.find(c => c.id === selectedCandidateId);

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

    if (!user) return null; // or loading spinner

    return (
        <main>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Official Ballot Paper 2026</h2>
                <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Voter: {user.name}
                </div>
                <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-color)' }}>
                    Please select one candidate from the list below. Your vote is encrypted and anonymous.
                </p>

                <div className="candidate-grid">
                    {CANDIDATES.map(c => (
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
                        {isVoting ? 'Encrypting Vote...' : (selectedCandidateId ? `Vote for ${CANDIDATES.find(c => c.id === selectedCandidateId)?.name}` : 'Confirm & Cast Vote')}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Vote;
