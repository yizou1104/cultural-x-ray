// In production (Render), VITE_API_URL is the backend service URL.
// In dev, it's empty so relative URLs go through the Vite proxy.
export const API_BASE = import.meta.env.VITE_API_URL ?? ''
