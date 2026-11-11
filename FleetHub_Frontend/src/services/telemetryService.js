import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from './apiClient';

let stompClient = null;

/**
 * Bepaalt de WebSocket URL.
 * Ondersteunt absolute URL's, relatieve paden (/api) en dynamische window-origins zonder te crashen.
 */
function getWebSocketBrokerUrl() {
    if (typeof window !== 'undefined' && window.__FLEETHUB_WS_URL__) {
        return window.__FLEETHUB_WS_URL__;
    }

    const baseOrigin = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost:8080';

    const resolvedUrl = API_BASE_URL.startsWith('http')
        ? API_BASE_URL
        : `${baseOrigin}${API_BASE_URL.startsWith('/') ? '' : '/'}${API_BASE_URL}`;

    const parsed = new URL(resolvedUrl);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${parsed.host}/ws/fleet`;
}

/**
 * Initialiseert en activeert de STOMP WebSocket client voor realtime GPS telemetrie.
 */
export function initTelemetrySocket(onConnectSuccess, onError) {
    if (stompClient && stompClient.active) {
        return stompClient;
    }

    stompClient = new Client({
        brokerURL: getWebSocketBrokerUrl(),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            console.log('[Telemetry WS] Connected to fleet broker');
            if (onConnectSuccess) {
                onConnectSuccess();
            }
        },
        onStompError: (frame) => {
            const message = frame?.headers?.message || 'Onbekende brokerfout';
            const body = frame?.body || '';
            console.error('[Telemetry WS] Broker error:', message, body);
            if (onError) {
                onError(frame);
            }
        },
        onWebSocketClose: () => {
            console.warn('[Telemetry WS] Connection closed');
        }
    });

    stompClient.activate();
    return stompClient;
}

/**
 * Verzendt de actuele positie en telemetrie van de chauffeur naar de backend.
 */
export function sendDriverLocation(payload) {
    if (!stompClient || !stompClient.connected) {
        console.warn('[Telemetry WS] Cannot send location: socket not connected');
        return;
    }

    stompClient.publish({
        destination: '/app/driver/location',
        body: JSON.stringify(payload)
    });
}

/**
 * Verbreekt de WebSocket verbinding en ruimt de STOMP instantie op.
 */
export function disconnectTelemetrySocket() {
    if (stompClient) {
        try {
            stompClient.deactivate();
        } catch {
            // Negeer fouten tijdens deactivatie
        }
        stompClient = null;
    }
}