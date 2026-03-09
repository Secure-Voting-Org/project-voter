import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import AudioAssist from './AudioAssist';
const Navbar = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar">
            <Link to="/" className="logo">
                <img
                    src="/assets/images/logo.png"
                    alt="TrustBallot Logo"
                    style={{ height: '70px', marginRight: '15px' }}
                />
                {t('navbar.title')}
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/">{t('navbar.home')}</Link>
                {!isLoggedIn ? (
                    <>
                        <Link to="/login">{t('navbar.login')}</Link>
                    </>
                ) : (
                    <>
                        {user?.role === 'admin' && <Link to="/admin">{t('navbar.admin')}</Link>}
                        {user?.role === 'voter' && <Link to="/vote">{t('navbar.booth')}</Link>}
                        <button
                            onClick={handleLogout}
                            style={{ marginLeft: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            {t('navbar.logout')} ({user?.name})
                        </button>
                    </>
                )}
                <LanguageSwitcher />
                <AudioAssist />
            </nav>
        </header>
    );
};

// CRITICAL: This line must match the import in App.jsx
export default Navbar;
