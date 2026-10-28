import { apiFetch } from './apiClient';

/**
 * US2: Haalt publieke track & trace informatie op voor een ordernummer.
 */
export async function fetchTrackingInfo(orderNumber) {
    if (!orderNumber || !orderNumber.trim()) {
        throw new Error('Vul een geldig ordernummer in.');
    }

    return apiFetch(
        `/tracking/${encodeURIComponent(orderNumber.trim())}`,
        { method: 'GET' },
        `Bestelling ${orderNumber} niet gevonden`
    );
}