import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_AVATAR_FALLBACK =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='64' fill='%231e293b'/><circle cx='64' cy='46' r='24' fill='%2364748b'/><path d='M24 112 C24 84, 42 78, 64 78 C86 78, 104 84, 104 112 Z' fill='%2364748b'/></svg>";

const createDriverAvatarIcon = (driverName = '', avatarUrl = null, heading = 0, isMoving = false) => {
    const borderColor = isMoving ? '#3b82f6' : '#64748b';
    const imageSrc = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : DEFAULT_AVATAR_FALLBACK;

    return L.divIcon({
        className: 'driver-avatar-marker',
        html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <!-- Richtingspijl -->
        <div style="
          position: absolute;
          top: -6px;
          transform: rotate(${heading}deg);
          transform-origin: center 28px;
          transition: transform 0.4s ease-out;
          z-index: 10;
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 8px solid ${borderColor};
          "></div>
        </div>

        <!-- Avatar cirkel -->
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img
            src="${imageSrc}"
            alt="${driverName}"
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            onerror="this.onerror=null; this.src='${DEFAULT_AVATAR_FALLBACK}';"
          />
        </div>

        <!-- Status indicator dot -->
        <div style="
          position: absolute;
          bottom: 0px;
          right: 0px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${isMoving ? '#22c55e' : '#f59e0b'};
          border: 2px solid #0f172a;
        "></div>
      </div>
    `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24]
    });
};

function AutoFitFleet({ vehicles }) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
        const coords = vehicles
            .filter((v) => v.latitude && v.longitude)
            .map((v) => [v.latitude, v.longitude]);

        if (coords.length === 1) {
            map.setView(coords[0], 14);
        } else if (coords.length > 1) {
            map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 });
        }
    }, [vehicles, map]);

    return null;
}

export default function FleetLiveMap({ vehicles = [] }) {
    const defaultCenter = [51.4416, 5.4697]; // Eindhoven Centrum

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <AutoFitFleet vehicles={vehicles} />

                {vehicles.map((v) => (
                    <Marker
                        key={v.vehicleId || v.driverId}
                        position={[v.latitude, v.longitude]}
                        icon={createDriverAvatarIcon(
                            v.driverName,
                            v.avatarUrl || v.profilePicture,
                            v.heading || 0,
                            (v.speed || 0) > 0.5
                        )}
                    >
                        <Popup>
                            <div style={{ color: '#0f172a', fontSize: '12px', lineHeight: '1.4' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                                        {v.driverName || 'Koerier'}
                                    </strong>
                                    <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                    Bus #{v.vehicleId || v.driverId}
                  </span>
                                </div>
                                <div><strong>Snelheid:</strong> {Math.round((v.speed || 0) * 3.6)} km/u</div>
                                {v.timestamp && (
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                        Laatste update: {new Date(v.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}