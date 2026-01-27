// Basic Authentication Utilities
export const Auth = {
    // Mock Database of Valid Voters
    MOCK_VOTERS: {
        'ABC1234567': { name: 'Jane Doe', constituency: 'Downtown-1', faceRegistered: true },
        'XYZ9876543': { name: 'John Smith', constituency: 'Uptown-4', faceRegistered: true },
        'TESTUSER': { name: 'Test Voter', constituency: 'Debug-0', faceRegistered: true }
    },

    // Verify Voter ID
    verifyVoterId: (id) => {
        return Auth.MOCK_VOTERS[id] || null;
    },

    // Save mock session data
    login: (userData) => {
        localStorage.setItem('user_token', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('user_info', JSON.stringify(userData));
        console.log("User logged in:", userData);
    },

    // Clear session data
    logout: () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        console.log("User logged out");
        // In React we might want to use navigation, but this helper just clears data
        // The component calling this should handle redirect if needed
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
