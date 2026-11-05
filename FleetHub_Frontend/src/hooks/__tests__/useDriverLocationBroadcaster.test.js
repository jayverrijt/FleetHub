import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDriverLocationBroadcaster } from '../useDriverLocationBroadcaster';
import * as telemetryService from '../../services/telemetryService';
import * as authService from '../../services/authService';

vi.mock('../../services/telemetryService', () => ({
    initTelemetrySocket: vi.fn((onSuccess) => onSuccess && onSuccess()),
    sendDriverLocation: vi.fn(),
    disconnectTelemetrySocket: vi.fn()
}));

vi.mock('../../services/authService', () => ({
    getCurrentUser: vi.fn(() => ({ id: 101, fullName: 'Jan de Vries' }))
}));

describe('useDriverLocationBroadcaster (US3a)', () => {
    let mockWatchPosition;
    let mockClearWatch;

    beforeEach(() => {
        mockWatchPosition = vi.fn();
        mockClearWatch = vi.fn();

        global.navigator.geolocation = {
            watchPosition: mockWatchPosition,
            clearWatch: mockClearWatch
        };
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initialiseert socket en geolocation watcher wanneer streaming actief is', () => {
        renderHook(() => useDriverLocationBroadcaster(true));

        expect(telemetryService.initTelemetrySocket).toHaveBeenCalledTimes(1);
        expect(mockWatchPosition).toHaveBeenCalledTimes(1);
    });

    it('stuurt telemetrie via sendDriverLocation zodra watchPosition een positie meldt', () => {
        let successCallback;
        mockWatchPosition.mockImplementation((cb) => {
            successCallback = cb;
            return 42;
        });

        const { result } = renderHook(() => useDriverLocationBroadcaster(true));

        act(() => {
            successCallback({
                coords: {
                    latitude: 51.4416,
                    longitude: 5.4697,
                    speed: 8.5,
                    heading: 90
                }
            });
        });

        expect(telemetryService.sendDriverLocation).toHaveBeenCalledWith(
            expect.objectContaining({
                driverId: 101,
                driverName: 'Jan de Vries',
                latitude: 51.4416,
                longitude: 5.4697,
                speed: 8.5,
                heading: 90
            })
        );
        expect(result.current.lastPosition).not.toBeNull();
    });

    it('ruimt de watcher en de verbinding op bij uitschakelen of unmount', () => {
        mockWatchPosition.mockReturnValue(99);

        const { unmount } = renderHook(() => useDriverLocationBroadcaster(true));
        unmount();

        expect(mockClearWatch).toHaveBeenCalledWith(99);
        expect(telemetryService.disconnectTelemetrySocket).toHaveBeenCalledTimes(1);
    });
});