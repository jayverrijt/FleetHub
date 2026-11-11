import { apiGet, apiPatch } from './apiClient';

/**
 * Haalt alle routes op voor een chauffeur ID
 */
export async function fetchDriverRoutes(driverId = 1) {
    return apiGet(`/routes?driverId=${driverId}`, 'Fout bij ophalen van routes');
}

/**
 * Haalt alle geordende haltes op voor een specifiek routeId
 */
export async function fetchStopsForRoute(routeId) {
    return apiGet(`/routes/${routeId}/stops`, `Fout bij ophalen van stops voor route ${routeId}`);
}

/**
 * Werkt de afleverstatus van een stop bij (DELIVERED, FAILED_NOT_HOME, etc.)
 */
export async function updateStopStatus(stopId, status) {
    return apiPatch(`/stops/${stopId}/status`, { status }, 'Fout bij bijwerken status');
}