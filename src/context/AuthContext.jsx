import React, { createContext, useState, useEffect, useContext } from 'react';
import { Auth } from '../utils/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Initial state is loading

    const login = async (userData) => {
        await Auth.login(userData);
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        Auth.logout();
        setUser(null);
        setIsLoggedIn(false);
    };

    useEffect(() => {
        try {
            if (Auth.isAuthenticated()) {
                const parsedUser = Auth.getUser();
                setUser(parsedUser);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            Auth.logout();
        } finally {
            setLoading(false); // MUST set to false so children can render
        }
    }, []);

    // While loading, show a simple message so the screen isn't white
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Initializing TrustBallot...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
