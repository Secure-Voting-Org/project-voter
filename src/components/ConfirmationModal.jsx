import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, candidate }) => {
    const { t } = useTranslation();

    if (!isOpen || !candidate) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                textAlign: 'center',
                position: 'relative',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '1.5rem', color: '#f57c00' }}>
                    <AlertTriangle size={48} />
                </div>

                <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                    {t('vote.confirm_title') || "Confirm Your Vote"}
                </h2>

                <p style={{ marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
                    {t('vote.confirm_desc') || "You are about to cast your vote for:"}
                </p>

                <div className="selected-candidate-preview" style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{candidate.symbol}</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#192742' }}>{candidate.name}</h3>
                    <p style={{ margin: 0, color: '#666', fontWeight: 500 }}>{candidate.party}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '1rem' }}
                    >
                        {t('vote.cancel_btn') || "Cancel"}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <Check size={20} />
                        {t('vote.confirm_btn') || "Confirm Vote"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
