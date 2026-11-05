import { apiGet, apiPatch } from './apiClient';

/**
 * Haalt alle routes op voor een chauffeur (bijv. driverId = 1)
 */
export function fetchDriverRoutes(driverId = 1) {
    return apiGet(`/routes?driverId=${driverId}`, 'Fout bij ophalen van routes');
}

/**
 * Haalt alle geordende stops op voor een specifiek routeId (bijv. 104)
 */
export function fetchStopsForRoute(routeId) {
    return apiGet(`/routes/${routeId}/stops`, `Fout bij ophalen van stops voor route ${routeId}`);
}

/**
 * US5b: Werkt de afleverstatus van een stop bij (DELIVERED, FAILED_NOT_HOME, etc.)
 */
export function updateStopStatus(stopId, status) {
    return apiPatch(`/stops/${stopId}/status`, { status }, 'Fout bij bijwerken status');
}