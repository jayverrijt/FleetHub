import { API_BASE_URL } from './apiClient';

export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Inloggen mislukt');
    }

    const data = await response.json();
    localStorage.setItem('fleethub_token', data.token);
    localStorage.setItem('fleethub_user', JSON.stringify(data));
    return data;
}

export function logout() {
    localStorage.removeItem('fleethub_token');
    localStorage.removeItem('fleethub_user');
}

export function getToken() {
    return localStorage.getItem('fleethub_token');
}

export function getCurrentUser() {
    const userJson = localStorage.getItem('fleethub_user');
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
}