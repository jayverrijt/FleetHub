import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from './apiClient';

let stompClient = null;

/**
 * Bepaalt de WebSocket URL op basis van de HTTP API_BASE_URL
 * Bijv. 'http://10.69.0.48:8081/api' -> 'ws://10.69.0.48:8081/ws/fleet'
 */
function getWebSocketBrokerUrl() {
    const parsed = new URL(API_BASE_URL);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${parsed.host}/ws/fleet`;
}

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
            if (onConnectSuccess) onConnectSuccess();
        },
        onStompError: (frame) => {
            console.error('[Telemetry WS] Broker error:', frame.headers['message'], frame.body);
            if (onError) onError(frame);
        },
        onWebSocketClose: () => {
            console.warn('[Telemetry WS] WebSocket connection closed');
        }
    });

    stompClient.activate();
    return stompClient;
}

export function sendDriverLocation(payload) {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/driver/location',
            body: JSON.stringify(payload)
        });
    } else {
        console.warn('[Telemetry WS] Cannot send location: socket not connected');
    }
}

export function disconnectTelemetrySocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}