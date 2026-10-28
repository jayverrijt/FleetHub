import { API_BASE_URL } from './apiClient';

/**
 * Logt een gebruiker in en ontvangt het JWT-token via een beveiligde HttpOnly cookie.
 */
export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Noodzakelijk om de HttpOnly Set-Cookie header te accepteren
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Inloggen mislukt');
    }

    const data = await response.json();
    // Alleen niet-gevoelige data opslaan (geen JWT-token meer in localStorage!)
    localStorage.setItem('fleethub_user', JSON.stringify(data));
    return data;
}

/**
 * Logt de gebruiker uit aan de backend (wist de HttpOnly cookie) en schoont de frontend op.
 */
export async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (err) {
        console.warn('Backend logout request mislukt:', err);
    } finally {
        localStorage.removeItem('fleethub_user');
    }
}

/**
 * Haalt de actueel ingelogde gebruikersgegevens op uit de browser.
 */
export function getCurrentUser() {
    const userJson = localStorage.getItem('fleethub_user');
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
}