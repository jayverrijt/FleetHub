import { useEffect, useState, useRef } from 'react';
import { getCurrentUser } from '../services/authService';
import { initTelemetrySocket, sendDriverLocation, disconnectTelemetrySocket } from '../services/telemetryService';

export function useDriverLocationBroadcaster(isStreamingActive = true) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastPosition, setLastPosition] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!isStreamingActive) {
            disconnectTelemetrySocket();
            return;
        }

        const currentUser = getCurrentUser() || { id: 1, fullName: 'Jan de Vries' };

        // 1. Initialiseer WebSocket verbinding via callbacks
        initTelemetrySocket(
            () => setIsConnected(true),
            () => setIsConnected(false)
        );

        // 2. Start HTML5 Geolocation API watcher
        if (!navigator.geolocation) {
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            const payload = {
                driverId: currentUser.userId || currentUser.id || 1,
                driverName: currentUser.fullName || 'Chauffeur',
                vehicleId: 1,
                latitude,
                longitude,
                speed: speed || 0,
                heading: heading || 0,
                timestamp: new Date().toISOString()
            };

            setLastPosition(payload);
            setGeoError(null);

            sendDriverLocation(payload);
        };

        const handleError = (error) => {
            console.warn('[Geolocation Error]:', error.message);
            setGeoError(error.message);
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 10000
            }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            disconnectTelemetrySocket();
            setIsConnected(false);
        };
    }, [isStreamingActive]);

    return { isConnected, lastPosition, geoError };
}