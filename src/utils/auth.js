import API_BASE from '../config/api';

// Basic Authentication Utilities
export const Auth = {
    // API Base URL
    API_URL: API_BASE,

    // Verify Voter ID (Supports Plain ID or Encrypted Payload)
    verifyVoterId: async (identifier) => {
        try {
            let body = {};
            if (typeof identifier === 'string') {
                body = { voterId: identifier };
            } else if (typeof identifier === 'object') {
                body = identifier;
            }

            const fetchUrl = `${Auth.API_URL}/api/verify-voter`;
            const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/verify-voter` : fetchUrl;

            const response = await fetch(urlToUse, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Verification Error:", error);
            return null;
        }
    },

    // Save session and log login
    login: async (userData) => {
        localStorage.setItem('user_token', 'jwt-token-' + Date.now()); // In real app, get token from backend
        localStorage.setItem('user_info', JSON.stringify(userData));

        // Log to backend
        try {
            const fetchUrl = `${Auth.API_URL}/api/login`;
            const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/login` : fetchUrl;
            await fetch(urlToUse, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData.id,
                    status: 'SUCCESS',
                    details: { method: 'FACE_AUTH' }
                })
            });
        } catch (e) {
            console.error("Logging failed", e);
        }
    },

    // Clear session data
    logout: () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
    },

    // Check if user is logged in
    isAuthenticated: () => {
        return !!localStorage.getItem('user_token');
    },

    // Get current user info
    getUser: () => {
        const data = localStorage.getItem('user_info');
        return data ? JSON.parse(data) : null;
    }
};
