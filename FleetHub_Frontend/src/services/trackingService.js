import { API_BASE_URL } from './apiClient';

export async function fetchTrackingInfo(orderNumber) {
    const response = await fetch(`${API_BASE_URL}/tracking/${orderNumber}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Bestelling ${orderNumber} niet gevonden.`);
    }
    return response.json();
}