import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    initTelemetrySocket,
    sendDriverLocation,
    disconnectTelemetrySocket
} from '../telemetryService';
import { Client } from '@stomp/stompjs';

let capturedConfig = null;
const mockPublish = vi.fn();
const mockDeactivate = vi.fn();

vi.mock('@stomp/stompjs', () => {
    class MockClient {
        constructor(config) {
            capturedConfig = config;
            Object.assign(this, config);
            this.activate = vi.fn(() => {
                if (config.onConnect) config.onConnect();
            });
            this.deactivate = mockDeactivate;
            this.publish = mockPublish;
            this.connected = true;
        }
    }

    return { Client: MockClient };
});

describe('telemetryService Unit Tests (US3a)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedConfig = null;
        disconnectTelemetrySocket();
        mockDeactivate.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-FE-TEL-01: initialiseert en activeert STOMP client met callbacks', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onConnectedMock = vi.fn();

        initTelemetrySocket(onConnectedMock);

        expect(onConnectedMock).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith('[Telemetry WS] Connected to fleet broker');

        // Valideer broker error callback met zowel message als body
        capturedConfig.onStompError({
            headers: { message: 'Broker Crash Fout' },
            body: 'Gedetailleerde broker foutmelding'
        });

        expect(errorSpy).toHaveBeenCalledWith(
            '[Telemetry WS] Broker error:',
            'Broker Crash Fout',
            'Gedetailleerde broker foutmelding'
        );

        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('UT-FE-TEL-02: sendDriverLocation publiceert payload naar /app/driver/location', () => {
        initTelemetrySocket();

        const samplePayload = {
            driverId: 101,
            latitude: 51.4416,
            longitude: 5.4697,
            speed: 12.5
        };

        sendDriverLocation(samplePayload);

        expect(mockPublish).toHaveBeenCalledWith({
            destination: '/app/driver/location',
            body: JSON.stringify(samplePayload)
        });
    });

    it('UT-FE-TEL-03: sendDriverLocation waarschuwt indien STOMP socket niet verbonden is', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        disconnectTelemetrySocket();

        sendDriverLocation({ latitude: 51.44 });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Telemetry WS] Cannot send location: socket not connected')
        );
        warnSpy.mockRestore();
    });

    it('UT-FE-TEL-04: disconnectTelemetrySocket deactiveert actieve client', () => {
        initTelemetrySocket();
        mockDeactivate.mockClear();

        disconnectTelemetrySocket();

        expect(mockDeactivate).toHaveBeenCalledTimes(1);
    });

    it('UT-FE-TEL-05: disconnectTelemetrySocket is idempotent wanneer client reeds null is', () => {
        disconnectTelemetrySocket();
        expect(() => disconnectTelemetrySocket()).not.toThrow();
    });
});