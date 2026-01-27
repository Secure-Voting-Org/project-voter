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
                    <Link to="/register" className="btn btn-secondary" style={{ width: 'auto', padding: '1rem 2rem' }}>Register to Vote</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div className="auth-container" style={{ margin: '0', textAlign: 'center' }}>
                    <h3>🔒 Secure Authentication</h3>
                    <p>Multi-factor authentication using NFC and Biometrics ensures that only you can cast your vote.</p>
                </div>
                <div className="auth-container" style={{ margin: '0', textAlign: 'center' }}>
                    <h3>🛡️ Privacy First</h3>
                    <p>Your identity is verified, but your vote remains anonymous using advanced cryptography.</p>
                </div>
                <div className="auth-container" style={{ margin: '0', textAlign: 'center' }}>
                    <h3>⛓️ Verifiable Ledger</h3>
                    <p>Every vote is logged on an immutable public ledger for complete transparency.</p>
                </div>
            </div>
        </main>
    );
};

export default Home;
