// Auto-detects backend URL:
// - In development: empty string → uses Vite proxy (localhost:5000)
// - In production: uses VITE_API_URL env var (set to Render URL)
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
