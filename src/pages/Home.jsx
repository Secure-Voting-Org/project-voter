import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();

    return (
        <main>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('home.title')}</h1>
                <p style={{ fontSize: '1.25rem', color: '#6c757d', marginBottom: '2rem' }}>
                    {t('home.subtitle')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/login" className="btn btn-primary" style={{ width: 'auto', padding: '1rem 2rem' }}>{t('home.login_btn')}</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {/* Saffron Box - Secure Auth */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #FF9933', backgroundColor: '#FFF5E6' }}>
                    <h3 style={{ color: '#E67700' }}>🔒 {t('home.secure_auth')}</h3>
                    <p>{t('home.secure_auth_desc')}</p>
                </div>

                {/* Light Blue Box - Verifiable (Middle) */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #87CEEB', backgroundColor: '#E0F7FA' }}>
                    <h3 style={{ color: '#0288D1' }}>⛓️ {t('home.verifiable')}</h3>
                    <p>{t('home.verifiable_desc')}</p>
                </div>

                {/* Green Box - Privacy First */}
                <div className="auth-container" style={{ margin: '0', textAlign: 'center', borderTop: '4px solid #138808', backgroundColor: '#E8F5E9' }}>
                    <h3 style={{ color: '#1B5E20' }}>🛡️ {t('home.privacy')}</h3>
                    <p>{t('home.privacy_desc')}</p>
                </div>
            </div>
        </main>
    );
};

export default Home;
