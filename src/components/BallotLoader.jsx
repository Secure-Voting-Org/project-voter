import React, { useState, useEffect } from 'react';
import { Auth } from '../utils/auth';

const BallotLoader = ({ voterId, onCandidatesLoad, t }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [electionPhase, setElectionPhase] = useState(null);

    useEffect(() => {
        const loadBallotData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Check Election Status
                const statusRes = await fetch(`${Auth.API_URL}/election/status`);
                if (!statusRes.ok) throw new Error("Failed to fetch election status");
                const statusData = await statusRes.json();

                setElectionPhase(statusData.phase);

                // 2. Load Candidates only if Election is LIVE
                if (statusData.phase === 'LIVE' && !statusData.is_kill_switch_active) {
                    const response = await fetch(`${Auth.API_URL}/voter/ballot/${voterId}`);
                    if (response.ok) {
                        const data = await response.json();
                        onCandidatesLoad(data.candidates);
                    } else {
                        // Fallback logic if needed (matching existing behavior)
                        const user = Auth.getUser();
                        if (user && user.constituency) {
                            const fallback = await fetch(`${Auth.API_URL}/candidates?constituency=${encodeURIComponent(user.constituency)}`);
                            if (fallback.ok) {
                                const fbData = await fallback.json();
                                onCandidatesLoad(fbData);
                            } else {
                                throw new Error("Could not retrieve candidates");
                            }
                        } else {
                            throw new Error("Voter metadata missing");
                        }
                    }
                } else {
                    onCandidatesLoad([]); // No candidates load if election is closed
                }
            } catch (err) {
                console.error("Ballot Loader Error:", err);
                setError(err.message);
                onCandidatesLoad([]);
            } finally {
                setLoading(false);
            }
        };

        if (voterId) {
            loadBallotData();
        }
    }, [voterId, onCandidatesLoad]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '1rem' }}>{t('vote.loading_ballot') || 'Loading localized ballot...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>
                <p>Error: {error}</p>
            </div>
        );
    }

    if (electionPhase !== 'LIVE') {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff3cd', borderRadius: '12px', border: '1px solid #ffeeba', color: '#856404' }}>
                <h3>Election is Currently Closed</h3>
                <p>The electronic voting system is only active during the LIVE polling phase. Please check the election schedule.</p>
            </div>
        );
    }

    return null; // Logic-only or invisible if everything is fine; the parent renders the candidates
};

export default BallotLoader;
