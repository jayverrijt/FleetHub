import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FleetLiveMap from '../FleetLiveMap';

const mockSetView = vi.fn();
const mockFitBounds = vi.fn();

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children, position }) => (
        <div data-testid="leaflet-marker" data-lat={position[0]} data-lng={position[1]}>
            {children}
        </div>
    ),
    Popup: ({ children }) => <div data-testid="marker-popup">{children}</div>,
    useMap: () => ({
        invalidateSize: vi.fn(),
        setView: mockSetView,
        fitBounds: mockFitBounds
    })
}));

describe('FleetLiveMap Complete Branch Tests (US3b)', () => {
    it('UT-MAP-01: Toont lege kaart wanneer er geen voertuigen zijn (regel 86: coords.length === 0)', () => {
        const { getByTestId, queryAllByTestId } = render(<FleetLiveMap vehicles={[]} />);

        expect(getByTestId('map-container')).toBeDefined();
        expect(queryAllByTestId('leaflet-marker')).toHaveLength(0);
        expect(mockSetView).not.toHaveBeenCalled();
        expect(mockFitBounds).not.toHaveBeenCalled();
    });

    it('UT-MAP-02: Negeert voertuigen met null of ongeldige GPS coördinaten', () => {
        const invalidVehicles = [
            { vehicleId: 1, latitude: null, longitude: null },
            { vehicleId: 2, latitude: undefined, longitude: undefined }
        ];

        render(<FleetLiveMap vehicles={invalidVehicles} />);
        expect(mockSetView).not.toHaveBeenCalled();
        expect(mockFitBounds).not.toHaveBeenCalled();
    });

    it('UT-MAP-03: Past kaart aan via setView bij exact 1 geldig voertuig (regel 86: coords.length === 1)', () => {
        const singleVehicle = [
            {
                vehicleId: 1,
                driverName: 'Jan de Vries',
                latitude: 51.4416,
                longitude: 5.4697,
                speed: 12.0
            }
        ];

        render(<FleetLiveMap vehicles={singleVehicle} />);
        expect(mockSetView).toHaveBeenCalledWith([51.4416, 5.4697], 14);
    });

    it('UT-MAP-04: Test alle optionele pop-up en fallback-branches (regels 11, 114, 127-130)', () => {
        const testVehicles = [
            {
                driverId: 10,
                latitude: 51.4400,
                longitude: 5.4600
            },
            {
                vehicleId: 2,
                driverName: 'Sophie Bakker',
                avatarUrl: 'https://cdn.fleethub.test/uploads/avatars/sophie.png',
                latitude: 51.4500,
                longitude: 5.4700,
                heading: 90,
                speed: 8.5,
                timestamp: '2026-11-11T10:00:00Z'
            }
        ];

        const { getAllByTestId, getByText } = render(<FleetLiveMap vehicles={testVehicles} />);

        expect(getAllByTestId('leaflet-marker')).toHaveLength(2);
        expect(getByText('Koerier')).toBeDefined();
        expect(getByText('Bus #10')).toBeDefined();
        expect(getByText('Sophie Bakker')).toBeDefined();
        expect(getByText(/Laatste update:/i)).toBeDefined();
        expect(mockFitBounds).toHaveBeenCalled();
    });
});