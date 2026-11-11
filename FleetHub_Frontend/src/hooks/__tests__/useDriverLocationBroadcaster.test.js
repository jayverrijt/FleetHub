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
    getCurrentUser: vi.fn(() => ({ userId: 101, fullName: 'Jan de Vries', avatarUrl: 'avatar.png' }))
}));

describe('useDriverLocationBroadcaster Branch Coverage (US3a & US3b)', () => {
    let mockWatchPosition;
    let mockClearWatch;

    beforeEach(() => {
        mockWatchPosition = vi.fn();
        mockClearWatch = vi.fn();

        global.navigator.geolocation = {
            watchPosition: mockWatchPosition,
            clearWatch: mockClearWatch
        };
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-BC-01: initialiseert socket en watcher wanneer streaming actief is', () => {
        renderHook(() => useDriverLocationBroadcaster(true));

        expect(telemetryService.initTelemetrySocket).toHaveBeenCalled();
        expect(mockWatchPosition).toHaveBeenCalled();
    });

    it('UT-BC-02: verbreekt verbinding direct als streaming inactief is', () => {
        renderHook(() => useDriverLocationBroadcaster(false));

        expect(telemetryService.disconnectTelemetrySocket).toHaveBeenCalled();
        expect(mockWatchPosition).not.toHaveBeenCalled();
    });

    it('UT-BC-03: vangt ontbrekende geolocation API af in browser', () => {
        delete global.navigator.geolocation;

        const { result } = renderHook(() => useDriverLocationBroadcaster(true));
        expect(result.current.lastPosition).toBeNull();
    });

    it('UT-BC-04: vangt GPS geolocation error callbacks af', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
        errorSpy.mockRestore();
    });

    it('UT-BC-05: hanteert afwezige speed en heading (speed || 0, heading || 0)', () => {
        let successCallback;
        mockWatchPosition.mockImplementation((cb) => {
            successCallback = cb;
            return 42;
        });

        renderHook(() => useDriverLocationBroadcaster(true));

        act(() => {
            successCallback({
                coords: {
                    latitude: 51.4416,
                    longitude: 5.4697,
                    speed: null,
                    heading: null
                }
            });
        });

        expect(telemetryService.sendDriverLocation).toHaveBeenCalledWith(
            expect.objectContaining({
                latitude: 51.4416,
                longitude: 5.4697,
                speed: 0,
                heading: 0
            })
        );
    });

    it('UT-BC-06: gebruikt localStorage avatar als die aanwezig is boven currentUser avatar', () => {
        localStorage.setItem('fleethub_avatar', 'custom_storage_avatar.png');

        let successCallback;
        mockWatchPosition.mockImplementation((cb) => {
            successCallback = cb;
            return 42;
        });

        renderHook(() => useDriverLocationBroadcaster(true));

        act(() => {
            successCallback({
                coords: { latitude: 51.4416, longitude: 5.4697, speed: 5.0, heading: 45 }
            });
        });

        expect(telemetryService.sendDriverLocation).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: 'custom_storage_avatar.png'
            })
        );
    });

    it('UT-BC-07: ruimt watcher en socket netjes op bij unmount', () => {
        mockWatchPosition.mockReturnValue(99);

        const { unmount } = renderHook(() => useDriverLocationBroadcaster(true));
        unmount();

        expect(mockClearWatch).toHaveBeenCalledWith(99);
        expect(telemetryService.disconnectTelemetrySocket).toHaveBeenCalled();
    });
});