const API_BASE_URL = 'http://localhost:8080/api';

/**
 * US2: Haalt publieke track & trace informatie op voor een specifiek ordernummer.
 */
export async function fetchTrackingInfo(orderNumber) {
    if (!orderNumber || !orderNumber.trim()) {
        throw new Error('Vul een geldig ordernummer in.');
    }

    const response = await fetch(`${API_BASE_URL}/tracking/${orderNumber.trim()}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Order '${orderNumber}' is niet gevonden.`);
        }
        throw new Error(`Fout bij ophalen tracking-informatie (HTTP ${response.status})`);
    }

    return response.json();
}