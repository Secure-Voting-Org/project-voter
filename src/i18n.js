import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'te', 'ta'],

        // Language names for reference
        // en: English
        // hi: Hindi
        // te: Telugu
        // ta: Tamil

        debug: false,

        interpolation: {
            escapeValue: false, // React already safe from XSS
        },

        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },

        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
