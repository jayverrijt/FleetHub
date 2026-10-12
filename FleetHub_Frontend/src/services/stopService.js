// src/services/stopService.js
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Haalt alle routes op voor een chauffeur (bijv. driverId = 1)
 */
export async function fetchDriverRoutes(driverId = 1) {
    const response = await fetch(`${API_BASE_URL}/routes?driverId=${driverId}`);
    if (!response.ok) {
        throw new Error(`Fout bij ophalen routes: HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * Haalt alle geordende stops op voor een specifiek routeId (bijv. 104)
 */
export async function fetchStopsForRoute(routeId) {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/stops`);
    if (!response.ok) {
        throw new Error(`Fout bij ophalen van stops voor route ${routeId}: HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * US5b: Werkt de afleverstatus van een stop bij
 */
export async function updateStopStatus(stopId, status) {
    const response = await fetch(`${API_BASE_URL}/stops/${stopId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error(`Fout bij bijwerken status: HTTP ${response.status}`);
    }
    return response.json();
}