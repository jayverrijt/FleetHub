import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteMap from '../RouteMap';

const mockSetView = vi.fn();
const mockFitBounds = vi.fn();
const mockInvalidateSize = vi.fn();

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children, center }) => (
        <div data-testid="map-container" data-center={JSON.stringify(center)}>
            {children}
        </div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children, position, eventHandlers, icon }) => (
        <div
            data-testid="route-marker"
            data-lat={position[0]}
            data-lng={position[1]}
            data-icon-html={icon?.options?.html || ''}
            onClick={eventHandlers?.click}
        >
            {children}
        </div>
    ),
    Popup: ({ children }) => <div data-testid="marker-popup">{children}</div>,
    Polyline: ({ positions }) => (
        <div data-testid="route-polyline" data-count={positions.length} />
    ),
    useMap: () => ({
        invalidateSize: mockInvalidateSize,
        setView: mockSetView,
        fitBounds: mockFitBounds
    })
}));

describe('RouteMap Component Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockStops = [
        {
            id: 20,
            sequenceOrder: 2,
            status: 'DELIVERED',
            recipientName: 'Tweede Stop',
            address: 'Kerkstraat 2',
            city: 'Eindhoven',
            latitude: 51.442,
            longitude: 5.471
        },
        {
            id: 10,
            sequenceOrder: 1,
            status: 'PENDING',
            recipientName: 'Eerste Stop',
            address: 'Kerkstraat 1',
            city: 'Eindhoven',
            latitude: 51.441,
            longitude: 5.47
        },
        {
            id: 30,
            sequenceOrder: 3,
            status: 'FAILED_NOT_HOME',
            recipientName: 'Derde Stop',
            address: 'Kerkstraat 3',
            city: 'Eindhoven',
            latitude: 51.443,
            longitude: 5.472
        },
        {
            id: 99,
            sequenceOrder: 4,
            status: 'PENDING',
            recipientName: 'Ongeldige Stop',
            address: 'Onbekend',
            city: 'Eindhoven',
            latitude: null, // Moet gefilterd worden
            longitude: null
        }
    ];

    it('UT-ROUTEMAP-01: Rendert standaard Eindhoven center bij lege stops array', () => {
        const { getByTestId, queryAllByTestId } = render(<RouteMap stops={[]} />);

        const container = getByTestId('map-container');
        expect(container.getAttribute('data-center')).toBe(JSON.stringify([51.4416, 5.4697]));
        expect(queryAllByTestId('route-marker')).toHaveLength(0);
        expect(mockSetView).not.toHaveBeenCalled();
        expect(mockFitBounds).not.toHaveBeenCalled();
    });

    it('UT-ROUTEMAP-02: Filtreert ongeldige stops, sorteert op sequenceOrder en past fitBounds toe', () => {
        const handleSelectStop = vi.fn();

        const { getAllByTestId, getByTestId, getByText } = render(
            <RouteMap stops={mockStops} onSelectStop={handleSelectStop} />
        );

        // Stop 99 (null lat/lng) is weggefilterd -> 3 markers over
        const markers = getAllByTestId('route-marker');
        expect(markers).toHaveLength(3);

        // Controleer volgorde: Eerste Stop (seq 1), Tweede Stop (seq 2), Derde Stop (seq 3)
        expect(markers[0].getAttribute('data-lat')).toBe('51.441');
        expect(markers[1].getAttribute('data-lat')).toBe('51.442');
        expect(markers[2].getAttribute('data-lat')).toBe('51.443');

        // Polyline aanwezig met 3 punten
        const polyline = getByTestId('route-polyline');
        expect(polyline.getAttribute('data-count')).toBe('3');

        // fitBounds moet aangeroepen zijn bij > 1 posities
        expect(mockInvalidateSize).toHaveBeenCalled();
        expect(mockFitBounds).toHaveBeenCalled();

        // Popups bevatten recipient names
        expect(getByText(/Stop #1: Eerste Stop/i)).toBeDefined();
        expect(getByText(/Stop #2: Tweede Stop/i)).toBeDefined();
        expect(getByText(/Stop #3: Derde Stop/i)).toBeDefined();
    });

    it('UT-ROUTEMAP-03: Past setView toe bij exact 1 geldige stop en rendert geen polyline', () => {
        const singleStop = [
            {
                id: 1,
                sequenceOrder: 1,
                status: 'PENDING',
                recipientName: 'Solo Stop',
                address: 'Solo straat 1',
                city: 'Eindhoven',
                latitude: 51.445,
                longitude: 5.465
            }
        ];

        const { queryByTestId, getAllByTestId } = render(<RouteMap stops={singleStop} />);

        expect(getAllByTestId('route-marker')).toHaveLength(1);
        expect(queryByTestId('route-polyline')).toBeNull();
        expect(mockSetView).toHaveBeenCalledWith([51.445, 5.465], 14);
    });

    it('UT-ROUTEMAP-04: Vuurt onSelectStop aan bij klik op marker en crasht niet indien onSelectStop ontbreekt', () => {
        const handleSelectStop = vi.fn();

        const { getAllByTestId, rerender } = render(
            <RouteMap stops={[mockStops[0]]} onSelectStop={handleSelectStop} />
        );

        const marker = getAllByTestId('route-marker')[0];
        fireEvent.click(marker);

        expect(handleSelectStop).toHaveBeenCalledTimes(1);
        expect(handleSelectStop).toHaveBeenCalledWith(
            expect.objectContaining({ recipientName: 'Tweede Stop' })
        );

        // Rerender zonder onSelectStop callback prop
        rerender(<RouteMap stops={[mockStops[0]]} />);
        expect(() => fireEvent.click(marker)).not.toThrow();
    });

    it('UT-ROUTEMAP-05: Toont juiste statuskleuren in het pin icoon HTML', () => {
        const { getAllByTestId } = render(<RouteMap stops={mockStops} />);
        const markers = getAllByTestId('route-marker');

        // Stop 1 (PENDING) -> #2563eb (blauw)
        expect(markers[0].getAttribute('data-icon-html')).toContain('#2563eb');

        // Stop 2 (DELIVERED) -> #16a34a (groen)
        expect(markers[1].getAttribute('data-icon-html')).toContain('#16a34a');

        // Stop 3 (FAILED_NOT_HOME) -> #dc2626 (rood)
        expect(markers[2].getAttribute('data-icon-html')).toContain('#dc2626');
    });
});