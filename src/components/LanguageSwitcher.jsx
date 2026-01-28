import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
    ];

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                style={{
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSwitcher;
