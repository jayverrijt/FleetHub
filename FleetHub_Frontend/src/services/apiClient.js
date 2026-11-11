import { logout } from './authService';

// Leest de base URL in vanuit de Vite build, met veilige relatieve fallback zonder hardcoded protocols
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
/**
 * Centrale response-afhandeling voor HTTP-verzoeken.
 * Vangt 401/403 autorisatiefouten af en logt de gebruiker uit.
 */
export async function handleApiResponse(response, defaultErrorMessage = 'Netwerkverzoek mislukt') {
    if (response.status === 401 || response.status === 403) {
        try {
            await logout();
        } catch {
            // Negeer eventuele fouten tijdens het opruimen van sessies
        }
        if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
        }
        throw new Error('Sessie verlopen of geen toegang. Log opnieuw in.');
    }

    if (!response.ok) {
        let errorDetail = defaultErrorMessage;
        try {
            const errJson = await response.json();
            errorDetail = errJson.message || errJson.error || defaultErrorMessage;
        } catch {
            // Response was geen JSON
        }
        throw new Error(errorDetail);
    }

    return response.json();
}

/**
 * Generieke fetch wrapper die headers en credentials injecteert.
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    return handleApiResponse(response, options.errorMessage);
}

export async function apiGet(endpoint, errorMessage) {
    return apiFetch(endpoint, { method: 'GET', errorMessage });
}

export async function apiPost(endpoint, body, errorMessage) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        errorMessage
    });
}

export async function apiPatch(endpoint, body, errorMessage) {
    return apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
        errorMessage
    });
}

export async function apiDelete(endpoint, errorMessage) {
    return apiFetch(endpoint, { method: 'DELETE', errorMessage });
}