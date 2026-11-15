import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../services/apiClient';

/**
 * Bepaalt de WebSocket broker URL op basis van VITE_WS_URL of de geconfigureerde API_BASE_URL.
 *
 * @returns {string} Volledige ws:// of wss:// URL naar /ws/fleet
 */
export function buildWsBrokerUrl() {
    if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
    }

    const base = new URL(API_BASE_URL, window.location.origin);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    base.pathname = '/ws/fleet';
    return base.toString();
}

/**
 * Custom React hook die de actuele vlootposities ophaalt en live bijhoudt via STOMP WebSockets.
 *
 * 1. Haalt bij het mounten een initiële snapshot op via GET /api/fleet/positions.
 * 2. Opent een STOMP-verbinding op /ws/fleet en abonneert zich op /topic/fleet/locations.
 * 3. Werkt voertuigposities real-time bij in een dictionary op basis van vehicleId (of driverId als fallback).
 *
 * @returns {{ vehicles: Array<Object>, isConnected: boolean }} Een lijst met actieve voertuigen en de live verbindingsstatus.
 */
export function useFleetTelemetry() {
    const [vehicles, setVehicles] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        // 1. Initiële snapshot ophalen via REST endpoint
        fetch(`${API_BASE_URL}/fleet/positions`, {
            credentials: 'include'
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                const initialMap = {};
                if (Array.isArray(data)) {
                    data.forEach((pos) => {
                        const id = pos.vehicleId || pos.driverId;
                        if (id) {
                            initialMap[id] = pos;
                        }
                    });
                }
                setVehicles(initialMap);
            })
            .catch((err) => console.warn('[Telemetry] Kon initiële snapshot niet ophalen:', err));

        // 2. STOMP WebSocket subscription opzetten
        const client = new Client({
            brokerURL: buildWsBrokerUrl(),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                client.subscribe('/topic/fleet/locations', (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        const id = payload?.vehicleId || payload?.driverId;
                        if (id) {
                            setVehicles((prev) => ({
                                ...prev,
                                [id]: payload
                            }));
                        }
                    } catch (err) {
                        console.error('[Telemetry] Fout bij parsen telemetriebody:', err);
                    }
                });
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('[Telemetry] Broker fout:', frame?.headers?.message || 'Onbekende fout');
                setIsConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        // Ruimt de WebSocket-verbinding netjes op bij het verlaten van de pagina
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return { vehicles: Object.values(vehicles), isConnected };
}