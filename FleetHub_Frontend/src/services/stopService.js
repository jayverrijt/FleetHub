import { API_BASE_URL, getAuthHeaders, handleApiResponse } from './apiClient';

export async function fetchDriverRoutes(driverId = 1) {
    const response = await fetch(`${API_BASE_URL}/routes?driverId=${driverId}`, {
        headers: getAuthHeaders()
    });
    return handleApiResponse(response, 'Fout bij ophalen routes');
}

export async function fetchStopsForRoute(routeId) {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/stops`, {
        headers: getAuthHeaders()
    });
    return handleApiResponse(response, `Fout bij ophalen van stops voor route ${routeId}`);
}

export async function updateStopStatus(stopId, status) {
    const response = await fetch(`${API_BASE_URL}/stops/${stopId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return handleApiResponse(response, 'Fout bij bijwerken status');
}