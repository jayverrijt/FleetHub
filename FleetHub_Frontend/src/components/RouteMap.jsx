import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const customPinIcon = (sequence, status) => {
    const color = status === 'DELIVERED'
        ? '#16a34a'
        : status === 'FAILED_NOT_HOME'
            ? '#dc2626'
            : '#2563eb';

    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; color: #ffffff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.45);">${sequence}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

function AutoFitRoute({ positions }) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();

        if (positions && positions.length > 0) {
            if (positions.length === 1) {
                map.setView(positions[0], 14);
            } else {
                const bounds = L.latLngBounds(positions);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [positions, map]);

    return null;
}

export default function RouteMap({ stops = [], onSelectStop }) {
    const validSortedStops = [...stops]
        .filter((s) => s.latitude && s.longitude)
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const positions = validSortedStops.map((s) => [s.latitude, s.longitude]);
    const centerPosition = positions.length > 0 ? positions[0] : [51.4416, 5.4697];

    return (
        <div className="map-container" style={{ height: '100%', width: '100%', minHeight: '350px' }}>
            <MapContainer
                center={centerPosition}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {positions.length > 0 && <AutoFitRoute positions={positions} />}

                {positions.length > 1 && (
                    <Polyline
                        positions={positions}
                        color="#3b82f6"
                        weight={4}
                        dashArray="6, 8"
                        opacity={0.85}
                    />
                )}

                {validSortedStops.map((stop) => (
                    <Marker
                        key={stop.id}
                        position={[stop.latitude, stop.longitude]}
                        icon={customPinIcon(stop.sequenceOrder, stop.status)}
                        eventHandlers={{
                            click: () => onSelectStop && onSelectStop(stop)
                        }}
                    >
                        <Popup>
                            <strong>Stop #{stop.sequenceOrder}: {stop.recipientName}</strong><br />
                            {stop.address}, {stop.city}<br />
                            <span style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#fff',
                                backgroundColor: stop.status === 'DELIVERED' ? '#16a34a' : stop.status === 'FAILED_NOT_HOME' ? '#dc2626' : '#2563eb'
                            }}>
                                {stop.status}
                            </span>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}