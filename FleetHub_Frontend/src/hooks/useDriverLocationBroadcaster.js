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
            setIsConnected(false);
            return;
        }

        const currentUser = getCurrentUser() || { id: 1, fullName: 'Jan de Vries' };

        // 1. Initialiseer WebSocket verbinding
        initTelemetrySocket(
            () => setIsConnected(true),
            () => setIsConnected(false)
        );

        // 2. Start HTML5 Geolocation API watcher
        if (!navigator.geolocation) {
            setGeoError('Geolocation API wordt niet ondersteund door deze browser.');
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            const payload = {
                driverId: currentUser.id || 1,
                driverName: currentUser.fullName || 'Chauffeur',
                vehicleId: 1, // Gekoppeld voertuig
                latitude,
                longitude,
                speed: speed || 0,
                heading: heading || 0,
                timestamp: new Date().toISOString()
            };

            setLastPosition(payload);
            setGeoError(null);

            // Stream live coördinaten direct over WebSocket
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
        };
    }, [isStreamingActive]);

    return { isConnected, lastPosition, geoError };
}