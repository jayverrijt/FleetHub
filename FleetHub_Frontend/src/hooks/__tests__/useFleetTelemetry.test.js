import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFleetTelemetry, buildWsBrokerUrl } from '../useFleetTelemetry';

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

describe('useFleetTelemetry Unit & Branch Coverage Tests (US3b)', () => {
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
                        speed: 10.0
                    }
                ])
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('UT-FE-FLT-01: Laadt initiële voertuigposities bij het mounten met credentials', async () => {
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/fleet\/positions$/),
            { credentials: 'include' }
        );
        expect(result.current.vehicles).toHaveLength(1);
        expect(result.current.isConnected).toBe(true);
    });

    it('UT-FE-FLT-02: Handelt non-ok snapshot response en items zonder ID veilig af', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });

        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.vehicles).toEqual([]);
    });

    it('UT-FE-FLT-03: Vangt netwerkfout bij ophalen initiële snapshot af', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        global.fetch.mockRejectedValueOnce(new Error('Netwerk offline'));

        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.vehicles).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('UT-FE-FLT-04: Werkt bestaande en nieuwe voertuigen bij via STOMP (inclusief driverId fallback)', async () => {
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        // Update bestaand voertuig (vehicleId) + voeg nieuw voertuig toe via driverId fallback
        act(() => {
            subscribeCallback({ body: JSON.stringify({ vehicleId: 1, latitude: 51.45, longitude: 5.48, speed: 45 }) });
            subscribeCallback({ body: JSON.stringify({ driverId: 88, latitude: 51.49, longitude: 5.65, speed: 30 }) });
            subscribeCallback({ body: JSON.stringify({ latitude: 51.0, longitude: 5.0 }) }); // Geen ID -> negeren
        });

        expect(result.current.vehicles).toHaveLength(2);
        expect(result.current.vehicles.find((v) => v.vehicleId === 1)?.speed).toBe(45);
        expect(result.current.vehicles.find((v) => v.driverId === 88)).toBeDefined();
    });

    it('UT-FE-FLT-05: Negeert corrupte WebSocket berichten zonder te crashen', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            subscribeCallback({ body: 'Geen geldige JSON!' });
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(result.current.vehicles).toHaveLength(1);
        consoleSpy.mockRestore();
    });

    it('UT-FE-FLT-06: Handelt onDisconnect en onStompError callbacks correct af', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useFleetTelemetry());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isConnected).toBe(true);

        act(() => {
            stompConfig.onDisconnect();
        });
        expect(result.current.isConnected).toBe(false);

        act(() => {
            stompConfig.onStompError({ headers: { message: 'Broker crash' } });
        });
        expect(result.current.isConnected).toBe(false);
        errorSpy.mockRestore();
    });

    it('UT-FE-FLT-07: Deactiveert STOMP client bij het unmounten en respecteert VITE_WS_URL', () => {
        vi.stubEnv('VITE_WS_URL', 'wss://custom.fleethub.nl/ws/fleet');
        expect(buildWsBrokerUrl()).toBe('wss://custom.fleethub.nl/ws/fleet');

        const { unmount } = renderHook(() => useFleetTelemetry());
        unmount();

        expect(mockDeactivate).toHaveBeenCalledTimes(1);
    });
});