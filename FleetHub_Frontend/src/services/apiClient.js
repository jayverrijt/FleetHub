import { logout } from './authService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function apiFetch(endpoint, options = {}, defaultErrorMessage) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);
    return handleApiResponse(response, defaultErrorMessage);
}

export const apiGet = (endpoint, errorMsg) =>
    apiFetch(endpoint, { method: 'GET' }, errorMsg);

export const apiPost = (endpoint, body, errorMsg) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }, errorMsg);

export const apiPatch = (endpoint, body, errorMsg) =>
    apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, errorMsg);

export const apiDelete = (endpoint, errorMsg) =>
    apiFetch(endpoint, { method: 'DELETE' }, errorMsg);
