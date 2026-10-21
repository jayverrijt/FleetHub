import { getToken, logout } from './authService';

// Leest de variabele uit .env, met localhost:8080 als betrouwbare fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Bouwt standaard headers op inclusief Authorization Bearer token
 */
export function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

/**
 * Centrale response-afhandeling: vangt 401/403 af en logt automatisch uit
 */
export async function handleApiResponse(response, defaultErrorMessage) {
    if (response.status === 401 || response.status === 403) {
        logout();
        window.location.reload();
        throw new Error('Sessie verlopen of niet geautoriseerd. Log opnieuw in.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `${defaultErrorMessage} (HTTP ${response.status})`);
    }

    return response.json();
}