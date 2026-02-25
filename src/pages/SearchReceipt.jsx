import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, Clock, MapPin, Hash, CheckCircle2 } from 'lucide-react';
import { Auth } from '../utils/auth';

const SearchReceipt = () => {
    const [hash, setHash] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!hash || hash.trim().length !== 64) {
            setError('Please enter a valid 64-character receipt hash.');
            setResult(null);
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch(`${Auth.API_URL}/verify-receipt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionHash: hash.trim() })
            });

            const data = await response.json();

            if (response.ok && data.verified) {
                setResult(data.vote);
            } else {
                setError(data.message || 'Receipt not found in the system');
            }
        } catch (err) {
            setError('Network error. Unable to connect to verification server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 70px)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '3rem 1rem',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
                        color: 'white', marginBottom: '1.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <ShieldCheck size={40} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', color: '#000080', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                        Track Your Vote
                    </h1>
                    <p style={{ color: '#555', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Enter your cryptographic receipt hash to verify that your vote was successfully recorded on the immutable public ledger.
                    </p>
                </div>

                {/* Search Box */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '2rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem'
                }}>
                    <form onSubmit={handleSearch}>
                        <label style={{ display: 'block', fontWeight: 700, color: '#333', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            Cryptographic Receipt Hash
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                                    <Hash size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={hash}
                                    onChange={(e) => setHash(e.target.value)}
                                    placeholder="e.g. 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
                                    style={{
                                        width: '100%', padding: '1.1rem 1rem 1.1rem 3rem',
                                        fontSize: '1rem', fontFamily: 'monospace',
                                        border: '2px solid #e0e0e0', borderRadius: '10px',
                                        outline: 'none', transition: 'border-color 0.2s',
                                        backgroundColor: '#fafafa'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#000080'}
                                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !hash.trim()}
                                style={{
                                    padding: '0 2rem', background: '#000080', color: 'white',
                                    border: 'none', borderRadius: '10px', fontSize: '1.05rem',
                                    fontWeight: 700, cursor: loading || !hash.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    transition: 'background 0.2s', opacity: loading || !hash.trim() ? 0.7 : 1,
                                    minHeight: '3.5rem'
                                }}
                            >
                                {loading ? 'Verifying...' : <><Search size={20} /> Track Receipt</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div style={{
                        background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px',
                        padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <AlertCircle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ color: '#991B1B', margin: '0 0 0.25rem 0', fontWeight: 700 }}>Verification Failed</h3>
                            <p style={{ color: '#DC2626', margin: 0 }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {result && (
                    <div style={{
                        background: 'white', border: '2px solid #10B981', borderRadius: '16px',
                        padding: '2.5rem', position: 'relative', overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)', animation: 'slideUp 0.4s ease'
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: '#10B981' }}></div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <CheckCircle2 size={60} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
                            <h2 style={{ color: '#065F46', margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 800 }}>
                                Vote Successfully Verified!
                            </h2>
                            <p style={{ color: '#059669', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                                Your vote has been securely recorded on the immutable ledger.
                            </p>
                        </div>

                        <div style={{ background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ padding: '1.25rem', width: '35%', background: '#F3F4F6', color: '#4B5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={18} /> Block Number
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, fontWeight: 800, color: '#111827', fontSize: '1.2rem' }}>
                                    #{result.blockNumber}
                                </div>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ padding: '1.25rem', width: '35%', background: '#F3F4F6', color: '#4B5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} /> Constituency
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, fontWeight: 600, color: '#374151' }}>
                                    {result.constituency}
                                </div>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ padding: '1.25rem', width: '35%', background: '#F3F4F6', color: '#4B5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={18} /> Timestamp
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, color: '#374151' }}>
                                    {new Date(result.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ padding: '1.25rem', width: '35%', background: '#F3F4F6', color: '#4B5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Hash size={18} /> Receipt Hash
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, fontFamily: 'monospace', color: '#6B7280', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                                    {result.transactionHash}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SearchReceipt;
