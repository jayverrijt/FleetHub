import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDriverLocationBroadcaster } from '../useDriverLocationBroadcaster';
import * as telemetryService from '../../services/telemetryService';

vi.mock('../../services/telemetryService', () => ({
    initTelemetrySocket: vi.fn((onSuccess) => onSuccess && onSuccess()),
    sendDriverLocation: vi.fn(),
    disconnectTelemetrySocket: vi.fn()
}));

vi.mock('../../services/authService', () => ({
    getCurrentUser: vi.fn(() => ({ userId: 101, fullName: 'Jan de Vries' }))
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

        expect(telemetryService.initTelemetrySocket).toHaveBeenCalled();
        expect(mockWatchPosition).toHaveBeenCalled();
    });

    it('verbreekt verbinding direct als streaming inactief is', () => {
        renderHook(() => useDriverLocationBroadcaster(false));

        expect(telemetryService.disconnectTelemetrySocket).toHaveBeenCalled();
        expect(mockWatchPosition).not.toHaveBeenCalled();
    });

    it('vangt situatie af waarin browser geen geolocation ondersteunt', () => {
        delete global.navigator.geolocation;

        const { result } = renderHook(() => useDriverLocationBroadcaster(true));
        expect(result.current.lastPosition).toBeNull();
    });

    it('vangt geolocation foutmeldingen op via de error callback', () => {
        let errorCallback;
        mockWatchPosition.mockImplementation((_, errCb) => {
            errorCallback = errCb;
            return 12;
        });

        const { result } = renderHook(() => useDriverLocationBroadcaster(true));

        act(() => {
            errorCallback({ message: 'GPS signaal verloren' });
        });

        expect(result.current.geoError).toBe('GPS signaal verloren');
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
                longitude: 5.4697
            })
        );
        expect(result.current.lastPosition).not.toBeNull();
    });

    it('ruimt de watcher en socket netjes op bij unmount', () => {
        mockWatchPosition.mockReturnValue(99);

        const { unmount } = renderHook(() => useDriverLocationBroadcaster(true));
        unmount();

        expect(mockClearWatch).toHaveBeenCalledWith(99);
        expect(telemetryService.disconnectTelemetrySocket).toHaveBeenCalled();
    });
});