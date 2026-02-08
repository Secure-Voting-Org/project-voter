import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Auth } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Copy, Download, Home } from 'lucide-react';

const VoteSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { transactionHash } = location.state || {};

    if (!transactionHash) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>No Receipt Found</h2>
                <p>Please return to home.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(transactionHash);
        alert('Vote ID copied to clipboard!');
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([`SecureVote Receipt\n\nVote ID: ${transactionHash}\nDate: ${new Date().toLocaleString()}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "vote_receipt.txt";
        document.body.appendChild(element);
        element.click();
    };

    const handleHome = () => {
        Auth.logout();
        navigate('/');
    };

    return (
        <main>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <CheckCircle size={64} color="var(--success-color, #28a745)" />
                </div>

                <h2 style={{ marginBottom: '1rem' }}>{t('vote.success_title') || "Vote Cast Successfully!"}</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-color-secondary)' }}>
                    Your vote has been anonymously recorded on the blockchain.
                </p>

                <div className="receipt-card" style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Vote Receipt</h3>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <QRCodeSVG value={transactionHash} size={150} />
                    </div>

                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Your Vote ID</div>
                    <code style={{
                        display: 'block',
                        padding: '1rem',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        marginBottom: '1.5rem'
                    }}>
                        {transactionHash}
                    </code>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Copy size={18} /> Copy ID
                        </button>
                        <button className="btn btn-outline" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={18} /> Download Receipt
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={handleHome} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                        <Home size={18} /> Return to Home
                    </button>
                </div>
            </div>
        </main>
    );
};

export default VoteSuccess;
