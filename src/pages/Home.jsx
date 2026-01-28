import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <main>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Secure. Transparent. Democratic.</h1>
                <p style={{ fontSize: '1.25rem', color: '#6c757d', marginBottom: '2rem' }}>
                    The next generation of election integrity. verifiable by design.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/login" className="btn btn-primary" style={{ width: 'auto', padding: '1rem 2rem' }}>Cast Your Vote</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {/* Saffron Box - Secure Auth */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #FF9933', backgroundColor: '#FFF5E6' }}>
                    <h3 style={{ color: '#E67700' }}>🔒 Secure Authentication</h3>
                    <p>Multi-factor authentication using NFC and Biometrics ensures that only you can cast your vote.</p>
                </div>

                {/* Light Blue Box - Verifiable (Middle) */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #87CEEB', backgroundColor: '#E0F7FA' }}>
                    <h3 style={{ color: '#0288D1' }}>⛓️ Verifiable Ledger</h3>
                    <p>Every vote is logged on an immutable public ledger for complete transparency.</p>
                </div>

                {/* Green Box - Privacy First */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #138808', backgroundColor: '#E8F5E9' }}>
                    <h3 style={{ color: '#1B5E20' }}>🛡️ Privacy First</h3>
                    <p>Your identity is verified, but your vote remains anonymous using advanced cryptography.</p>
                </div>
            </div>
        </main>
    );
};

export default Home;
