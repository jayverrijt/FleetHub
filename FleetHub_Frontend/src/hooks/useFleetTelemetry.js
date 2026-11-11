import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const WS_BROKER_URL =
    import.meta.env.VITE_WS_URL ||
    (API_BASE_URL.startsWith('http')
        ? API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws/fleet')
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/fleet`);

export function useFleetTelemetry() {
    const [vehicles, setVehicles] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        // 1. Initial snapshot ophalen via REST endpoint
        fetch(`${API_BASE_URL}/fleet/positions`)
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

        // 2. STOMP subscription opzetten
        const client = new Client({
            brokerURL: WS_BROKER_URL,
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

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return { vehicles: Object.values(vehicles), isConnected };
}