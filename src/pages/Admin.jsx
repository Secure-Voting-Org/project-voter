import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
    // Mock Data for Pending Verifications
    const [pendingUsers, setPendingUsers] = useState([
        { id: 1, name: "Jane Doe", voterId: "ABC9876543", status: "Pending" },
        { id: 2, name: "John Smith", voterId: "XYZ1234567", status: "Verified" }
    ]);

    const handleVerify = (user) => {
        if (window.confirm("Verify this user's identity based on submitted documents?")) {
            // Update state to show processing
            setPendingUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, isProcessing: true } : u
            ));

            setTimeout(() => {
                setPendingUsers(prev => prev.map(u =>
                    u.id === user.id ? { ...u, status: "Verified", isProcessing: false } : u
                ));
            }, 1000);
        }
    };

    return (
        <main>
            <div className="dashboard-grid">
                <div className="sidebar">
                    <div className="sidebar-item active">Identity Verification</div>
                    <div className="sidebar-item">Manage Candidates</div>
                    <div className="sidebar-item">Election Settings</div>
                    <div className="sidebar-item">Audit Logs</div>
                </div>

                <div className="content-card">
                    <h2 style={{ marginBottom: '1.5rem' }}>Pending Verifications</h2>
                    <p>Review submitted voter documents and verify their eligibility.</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Voter ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.voterId}</td>
                                    <td>
                                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        {user.status === 'Pending' ? (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'inline-block', width: 'auto' }}
                                                onClick={() => handleVerify(user)}
                                                disabled={user.isProcessing}
                                            >
                                                {user.isProcessing ? 'Processing...' : 'Verify'}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'inline-block', width: 'auto' }}
                                                disabled
                                            >
                                                Approved
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default Admin;
