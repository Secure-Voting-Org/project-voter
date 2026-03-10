import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Auth } from '../utils/auth';

const HelpPage = () => {
    const [form, setForm] = useState({ subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const voter = JSON.parse(sessionStorage.getItem('voter') || '{}');
            const res = await fetch(`${Auth.API_URL}/api/support/ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: form.subject,
                    message: form.message,
                    voter_mobile: voter.mobile || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');
            setStatus('success');
            setForm({ subject: '', message: '' });
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 480 }}>
                    <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                        Support Ticket Submitted!
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        We've received your request and will get back to you shortly. If you have a registered phone number, we'll reach out via SMS.
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Submit Another Ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: 540, background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '10px' }}>
                        <MessageCircle size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#1e293b' }}>Voter Support</h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Submit a help request to an election official</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', color: '#374151', fontSize: '0.9rem' }}>
                            Subject <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={form.subject}
                            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            required
                            style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', background: 'white' }}
                        >
                            <option value="">Select a topic...</option>
                            <option value="Cannot login">Cannot login</option>
                            <option value="Vote not submitted">Vote not submitted</option>
                            <option value="Wrong constituency shown">Wrong constituency shown</option>
                            <option value="Aadhaar not recognized">Aadhaar not recognized</option>
                            <option value="Other issue">Other issue</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', color: '#374151', fontSize: '0.9rem' }}>
                            Message <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            required
                            rows={4}
                            placeholder="Describe the issue in detail..."
                            style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        style={{ padding: '0.85rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', opacity: status === 'loading' ? 0.7 : 1 }}
                    >
                        <Send size={18} />
                        {status === 'loading' ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HelpPage;
