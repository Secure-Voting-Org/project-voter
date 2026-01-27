import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        voterId: '',
        address: '',
        idDoc: null
    });
    const [statusMsg, setStatusMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMsg("Submitting securely...");

        // Simulation of API call
        setTimeout(() => {
            setStatusMsg("Registration Submitted! Pending Admin Verification.");
            setIsSubmitting(false);
            // Optionally reset form
            setFormData({
                fullName: '',
                voterId: '',
                address: '',
                idDoc: null
            });
            // Reset file input visually if needed, but managing file input in React controlled way is tricky without ref
            document.getElementById('idDoc').value = '';
        }, 1500);
    };

    return (
        <main>
            <div className="auth-container">
                <h2>Voter Registration</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            required
                            placeholder="As per government ID"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="voterId">Voter ID Number</label>
                        <input
                            type="text"
                            id="voterId"
                            name="voterId"
                            required
                            placeholder="e.g. ABC1234567"
                            value={formData.voterId}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Constituency / Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="idDoc">Upload Identity Document (PDF/JPG)</label>
                        <input
                            type="file"
                            id="idDoc"
                            name="idDoc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </button>
                </form>
                {statusMsg && (
                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        color: statusMsg.includes('Submitted') ? 'var(--success-color)' : 'inherit'
                    }}>
                        {statusMsg}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Register;
