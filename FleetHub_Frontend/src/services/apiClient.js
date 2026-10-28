import { logout } from './authService';

// Leest de base URL in vanuit de Vite environment (.env), met fallback naar localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Centrale response-afhandeling:
 * - Vangt 401 (Unauthorized) en 403 (Forbidden) netjes af
 * - Wist lokale opslag bij verlopen sessie en herlaadt naar het login-scherm
 * - Haalt backend foutmeldingen op uit de JSON-response
 */
export async function handleApiResponse(response, defaultErrorMessage = 'Netwerkverzoek mislukt') {
    if (response.status === 401 || response.status === 403) {
        logout();
        window.location.reload();
        throw new Error('Sessie verlopen of geen toegang. Log opnieuw in.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `${defaultErrorMessage} (HTTP ${response.status})`);
    }

    // Als de backend 204 No Content retourneert (geen body)
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

/**
 * Centrale fetch wrapper:
 * Voegt standaard 'credentials: include' toe (voor HttpOnly cookies)
 * en stelt automatisch JSON headers in.
 */
export async function apiFetch(endpoint, options = {}, defaultErrorMessage) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        credentials: 'include', // Zorgt ervoor dat de browser de HttpOnly JWT cookie meestuurt
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);
    return handleApiResponse(response, defaultErrorMessage);
}

// Handige shortcuts voor methodes
export const apiGet = (endpoint, errorMsg) =>
    apiFetch(endpoint, { method: 'GET' }, errorMsg);

export const apiPost = (endpoint, body, errorMsg) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }, errorMsg);

export const apiPatch = (endpoint, body, errorMsg) =>
    apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, errorMsg);

export const apiDelete = (endpoint, errorMsg) =>
    apiFetch(endpoint, { method: 'DELETE' }, errorMsg);