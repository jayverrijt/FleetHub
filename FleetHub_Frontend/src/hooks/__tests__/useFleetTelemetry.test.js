import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFleetTelemetry } from '../useFleetTelemetry';

let subscribeCallback = null;
let stompConfig = null;
const mockDeactivate = vi.fn();
const mockSubscribe = vi.fn((topic, cb) => {
    subscribeCallback = cb;
    return { unsubscribe: vi.fn() };
});

vi.mock('@stomp/stompjs', () => {
    class MockClient {
        constructor(config) {
            stompConfig = config;
            Object.assign(this, config);
            this.activate = vi.fn(() => {
                if (config.onConnect) config.onConnect();
            });
            this.deactivate = mockDeactivate;
            this.subscribe = mockSubscribe;
        }
    }

    return { Client: MockClient };
});

describe('useFleetTelemetry Branch Coverage Tests (US3b)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        subscribeCallback = null;
        stompConfig = null;

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        vehicleId: 1,
                        driverName: 'Jan de Vries',
                        latitude: 51.4416,
                        longitude: 5.4697,
                        speed: 10.0,
                        avatarUrl: 'https://cdn.fleethub.test/uploads/avatars/driver_1.jpg'
                    }
                ])
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-FE-FLT-01: Laadt initiële voertuigposities bij mount', async () => {
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/fleet\/positions$/)
        );
        expect(result.current.vehicles).toHaveLength(1);
        expect(result.current.isConnected).toBe(true);
    });

    it('UT-FE-FLT-02: Hanteert response ok === false bij initial snapshot (dekt fallback [])', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve([])
        });

        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.vehicles).toEqual([]);
        expect(result.current.isConnected).toBe(true);
    });

    it('UT-FE-FLT-03: Vangt netwerkfout bij snapshot fetch netjes af', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        global.fetch.mockRejectedValueOnce(new Error('Netwerk offline'));

        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.vehicles).toEqual([]);
        expect(result.current.isConnected).toBe(true);
        warnSpy.mockRestore();
    });

    it('UT-FE-FLT-04: Dekt payload met driverId fallback wanneer vehicleId ontbreekt (regel 37 branch)', async () => {
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            subscribeCallback({
                body: JSON.stringify({
                    driverId: 88,
                    driverName: 'Karel',
                    latitude: 51.45,
                    longitude: 5.47,
                    speed: 11.0
                })
            });
        });

        expect(result.current.vehicles).toHaveLength(2);
        const karel = result.current.vehicles.find((v) => v.driverId === 88);
        expect(karel).toBeDefined();
        expect(karel.driverName).toBe('Karel');
    });

    it('UT-FE-FLT-05: Negeert payload zonder identifier of met corrupte JSON (regel 37 false branch)', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            subscribeCallback({
                body: JSON.stringify({ heartbeat: true })
            });
        });
        expect(result.current.vehicles).toHaveLength(1);

        act(() => {
            subscribeCallback({ body: '{ongeldig' });
        });
        expect(consoleSpy).toHaveBeenCalled();
        expect(result.current.vehicles).toHaveLength(1);
        consoleSpy.mockRestore();
    });

    it('UT-FE-FLT-06: Verwerkt onDisconnect en onStompError statusovergangen', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isConnected).toBe(true);

        act(() => {
            if (stompConfig?.onDisconnect) stompConfig.onDisconnect();
        });
        expect(result.current.isConnected).toBe(false);

        act(() => {
            if (stompConfig?.onStompError) stompConfig.onStompError({ headers: { message: 'Broker error' } });
        });
        expect(result.current.isConnected).toBe(false);
        errorSpy.mockRestore();
    });

    it('UT-FE-FLT-07: Deactiveert STOMP client bij unmount', () => {
        const { unmount } = renderHook(() => useFleetTelemetry());
        unmount();

        expect(mockDeactivate).toHaveBeenCalledTimes(1);
    });
});