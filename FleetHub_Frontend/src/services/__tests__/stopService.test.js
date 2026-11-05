import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDriverRoutes, fetchStopsForRoute, updateStopStatus } from '../stopService';
import * as apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
    apiGet: vi.fn(),
    apiPatch: vi.fn()
}));

describe('stopService Unit Tests (LO4 Quality Gate)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('UT-FE-STOP-01: haalt routes op voor een chauffeur ID', async () => {
        const mockRoutes = [{ id: 104, name: 'Eindhoven Centrum', status: 'IN_PROGRESS' }];
        vi.mocked(apiClient.apiGet).mockResolvedValueOnce(mockRoutes);

        const result = await fetchDriverRoutes(1);

        expect(apiClient.apiGet).toHaveBeenCalledWith(
            '/routes?driverId=1',
            expect.any(String)
        );
        expect(result).toEqual(mockRoutes);
    });

    it('UT-FE-STOP-02: haalt stops op voor een specifiek routeId', async () => {
        const mockStops = [
            { id: 1, recipientName: 'Fontys Rachelsmolen R1', sequenceOrder: 1, status: 'PENDING' }
        ];
        vi.mocked(apiClient.apiGet).mockResolvedValueOnce(mockStops);

        const result = await fetchStopsForRoute(104);

        expect(apiClient.apiGet).toHaveBeenCalledWith('/routes/104/stops', expect.any(String));
        expect(result).toEqual(mockStops);
    });

    it('UT-FE-STOP-03: werkt afleverstatus bij naar DELIVERED', async () => {
        const mockUpdated = { id: 1, status: 'DELIVERED' };
        vi.mocked(apiClient.apiPatch).mockResolvedValueOnce(mockUpdated);

        const result = await updateStopStatus(1, 'DELIVERED');

        expect(apiClient.apiPatch).toHaveBeenCalledWith(
            '/stops/1/status',
            { status: 'DELIVERED' },
            expect.any(String)
        );
        expect(result).toEqual(mockUpdated);
    });
});