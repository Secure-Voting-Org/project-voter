// Basic Authentication Utilities
export const Auth = {
    // API Base URL
    API_URL: 'http://localhost:5000/api',

    // Verify Voter ID
    verifyVoterId: async (id) => {
        try {
            const response = await fetch(`${Auth.API_URL}/verify-voter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voterId: id })
            });

            if (!response.ok) {
                return null;
            }

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
            await fetch(`${Auth.API_URL}/login`, {
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
