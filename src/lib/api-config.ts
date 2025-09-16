// API Configuration (frontend)
// Uses Vite env when available, falls back to Azure App Service URL.
const envBase = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) || '';

export const API_CONFIG = {
  baseURL: envBase || 'https://riskvisio-demo.azurewebsites.net',
  endpoints: {
    health: '/health',
    sync: '/api/sync',
    occurrences: '/api/occurrences',
    incidents: '/api/incidents',
    risks: '/api/risks',
    compliance: '/api/compliance',
  }
};

export const getApiUrl = (endpoint: string) => `${API_CONFIG.baseURL}${endpoint}`;

// Build auth headers from environment (supports either single API key or client id/secret)
const getAuthHeaders = () => {
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const headers: Record<string, string> = {};
  if (env.VITE_API_KEY) {
    headers['x-api-key'] = String(env.VITE_API_KEY);
  }
  if (env.VITE_API_CLIENT_ID) {
    headers['x-client-id'] = String(env.VITE_API_CLIENT_ID);
  }
  if (env.VITE_API_CLIENT_SECRET) {
    headers['x-client-secret'] = String(env.VITE_API_CLIENT_SECRET);
  }
  return headers;
};

// Convenience wrapper to fetch with base URL and auth headers
export const apiFetch = (endpoint: string, init: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const auth = getAuthHeaders();
  const headers = { 'Content-Type': 'application/json', ...(init.headers || {}), ...auth } as Record<string, string>;
  return fetch(url, { ...init, headers });
};
