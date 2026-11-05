import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initTelemetrySocket, sendDriverLocation, disconnectTelemetrySocket } from '../telemetryService';
import { Client } from '@stomp/stompjs';

// Bewaar referenties naar de mock-methoden voor assertions
const mockActivate = vi.fn();
const mockDeactivate = vi.fn();
const mockPublish = vi.fn();
let lastClientInstance = null;

vi.mock('@stomp/stompjs', () => {
    // Gebruik een volwaardige class zodat 'new Client(...)' valide is
    class MockClient {
        constructor(config) {
            Object.assign(this, config);
            this.active = true;
            this.connected = true;
            this.activate = mockActivate;
            this.deactivate = mockDeactivate;
            this.publish = mockPublish;
            lastClientInstance = this;
        }
    }

    return { Client: MockClient };
});

describe('telemetryService Unit Tests (US3a)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        lastClientInstance = null;
        disconnectTelemetrySocket();
    });

    it('UT-FE-TEL-01: initialiseert en activeert STOMP client met callbacks', () => {
        const onConnectSuccess = vi.fn();
        const onError = vi.fn();

        const client = initTelemetrySocket(onConnectSuccess, onError);

        expect(client).toBeDefined();
        expect(mockActivate).toHaveBeenCalledTimes(1);

        // Test de geregistreerde event handlers
        client.onConnect();
        expect(onConnectSuccess).toHaveBeenCalledTimes(1);

        client.onStompError({ headers: { message: 'Broker Crash' }, body: 'Fout' });
        expect(onError).toHaveBeenCalledTimes(1);

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        client.onWebSocketClose();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('UT-FE-TEL-02: herbruikt bestaande active client bij dubbele initialisatie', () => {
        const firstClient = initTelemetrySocket();
        const secondClient = initTelemetrySocket();

        expect(firstClient).toBe(secondClient);
        expect(mockActivate).toHaveBeenCalledTimes(1);
    });

    it('UT-FE-TEL-03: verzendt telemetrie payload wanneer client connected is', () => {
        initTelemetrySocket();

        const payload = {
            driverId: 1,
            latitude: 51.4416,
            longitude: 5.4697,
            speed: 12.0
        };

        sendDriverLocation(payload);

        expect(mockPublish).toHaveBeenCalledWith({
            destination: '/app/driver/location',
            body: JSON.stringify(payload)
        });
    });

    it('UT-FE-TEL-04: logt warning als sendDriverLocation wordt aangeroepen zonder actieve socket', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Zorg dat stompClient niet connected is
        initTelemetrySocket();
        if (lastClientInstance) {
            lastClientInstance.connected = false;
        }

        sendDriverLocation({ driverId: 1 });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Telemetry WS] Cannot send location: socket not connected')
        );
        warnSpy.mockRestore();
    });

    it('UT-FE-TEL-05: deactiveert socket en wist client instantie bij disconnect', () => {
        initTelemetrySocket();
        mockDeactivate.mockClear(); // Reset de teller specifiek voor deze interactie

        disconnectTelemetrySocket();

        expect(mockDeactivate).toHaveBeenCalledTimes(1);
    });
});