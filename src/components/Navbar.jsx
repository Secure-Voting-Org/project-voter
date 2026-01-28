import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isLoggedIn, logout } = useAuth();

    return (
        <header className="navbar">
            <Link to="/" className="logo">
                <img
                    src="/assets/images/logo.png"
                    alt="TrustBallot Logo"
                    style={{ height: '70px', marginRight: '15px' }}
                />
                TrustBallot
            </Link>
            <nav>
                <Link to="/">Home</Link>
                {!isLoggedIn ? (
                    <>
                        <Link to="/login">Login</Link>
                    </>
                ) : (
                    <>
                        {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                        {user?.role === 'voter' && <Link to="/vote">Voting Booth</Link>}
                        <button
                            onClick={logout}
                            style={{ marginLeft: '10px', cursor: 'pointer' }}
                        >
                            Logout ({user?.name})
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
};

// CRITICAL: This line must match the import in App.jsx
export default Navbar;