import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteView from '../RouteView';
import * as stopService from '../../services/stopService';

vi.mock('../../hooks/useDriverLocationBroadcaster', () => ({
    useDriverLocationBroadcaster: vi.fn()
}));

vi.mock('../../services/stopService', () => ({
    fetchDriverRoutes: vi.fn().mockResolvedValue([]),
    fetchStopsForRoute: vi.fn().mockResolvedValue([]),
    updateStopStatus: vi.fn().mockResolvedValue({})
}));

vi.mock('../../components/RouteMap', () => ({
    default: ({ stops, minHeight, onSelectStop }) => (
        <div
            data-testid="route-map"
            data-min-height={minHeight}
            data-stop-sequences={stops.map((s) => s.sequenceOrder).join(',')}
            onClick={() => {
                const pending = stops.find((s) => s.status === 'PENDING');
                if (onSelectStop && pending) {
                    onSelectStop(pending);
                }
            }}
        />
    )
}));

describe('RouteView Unit Tests (Active Stop Flow, Tabs & Driver Profile)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(window, 'open').mockImplementation(() => null);
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        stopService.fetchDriverRoutes.mockResolvedValue([]);
        stopService.fetchStopsForRoute.mockResolvedValue([]);
        stopService.updateStopStatus.mockResolvedValue({});
    });

    it('UT-ROUTEVIEW-01: Opent het bezorgscherm met ordergegevens, reistijd, navigatieknop en 2-punts kaart', async () => {
        render(<RouteView />);

        fireEvent.click(screen.getByText(/Route #104 - Eindhoven & Helmond/i));

        const nextBtn = await screen.findByRole('button', { name: /Volgende stop: #5/i });
        fireEvent.click(nextBtn);

        expect(screen.getByText(/Stop #5 van 5/i)).toBeDefined();
        expect(screen.getByText('Jay Verrijt')).toBeDefined();
        expect(screen.getByText(/Order: ORD-1003/i)).toBeDefined();
        expect(screen.getByText(/Geschatte reistijd/i)).toBeDefined();
        expect(screen.getByText(/~\d+ min/i)).toBeDefined();

        const mapEl = screen.getByTestId('route-map');
        expect(mapEl.getAttribute('data-stop-sequences')).toBe('4,5');
        expect(mapEl.getAttribute('data-min-height')).toBe('250px');

        fireEvent.click(screen.getByRole('button', { name: /Start Navigatie/i }));
        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open.mock.calls[0][0]).toContain('google.com/maps/dir');
        expect(window.open.mock.calls[0][0]).toContain('Kievitstraat%2036');

        // Keer terug naar stoppenlijst vanuit bezorgscherm
        fireEvent.click(screen.getByRole('button', { name: /Terug naar stoppenlijst/i }));
        expect(screen.getByRole('button', { name: /Stoppenlijst/i })).toBeDefined();
    });

    it('UT-ROUTEVIEW-02: Markeert stop als Delivered en keert terug naar overzicht wanneer alle stops klaar zijn', async () => {
        render(<RouteView />);

        fireEvent.click(screen.getByText(/Route #104 - Eindhoven & Helmond/i));
        fireEvent.click(await screen.findByRole('button', { name: /Volgende stop: #5/i }));

        fireEvent.click(screen.getByRole('button', { name: /^Delivered$/i }));

        await waitFor(() => {
            expect(stopService.updateStopStatus).toHaveBeenCalledWith(5, 'DELIVERED');
            expect(screen.getByText('Alle stops voltooid')).toBeDefined();
        });
    });

    it('UT-ROUTEVIEW-03: Markeert stop als Not Delivered (FAILED_NOT_HOME) en schakelt door naar volgende stop', async () => {
        render(<RouteView />);

        fireEvent.click(screen.getByText(/Helmond West - Middag/i));
        fireEvent.click(await screen.findByRole('button', { name: /Volgende stop: #1/i }));

        expect(screen.getByText('Daan Peters')).toBeDefined();

        fireEvent.click(screen.getByRole('button', { name: /^Not Delivered$/i }));

        await waitFor(() => {
            expect(stopService.updateStopStatus).toHaveBeenCalledWith(6, 'FAILED_NOT_HOME');
            expect(screen.getByText('Emma Hermans')).toBeDefined();
            expect(screen.getByTestId('route-map').getAttribute('data-stop-sequences')).toBe('1,2');
        });
    });

    it('UT-ROUTEVIEW-04: Haalt routes en stops op vanuit API en schakelt tussen tabs, GPS en routeoverzicht', async () => {
        stopService.fetchDriverRoutes.mockResolvedValueOnce([
            { id: 201, name: 'API Route Noord', status: 'PLANNED' }
        ]);
        stopService.fetchStopsForRoute.mockResolvedValueOnce([
            {
                id: 50,
                sequenceOrder: 1,
                status: 'PENDING',
                recipientName: 'API Klant',
                orderNumber: 'ORD-API-1',
                address: 'Stationsplein 1',
                city: 'Eindhoven',
                latitude: 51.443,
                longitude: 5.479
            }
        ]);

        render(<RouteView currentUser={{ id: 7, fullName: 'Sander Hendriks' }} />);

        const apiRouteCard = await screen.findByText('API Route Noord');
        fireEvent.click(apiRouteCard);

        expect(await screen.findByText('API Klant')).toBeDefined();

        // Start en pauzeer GPS-streaming
        const gpsToggle = screen.getByRole('button', { name: /Start Rit \/ GPS/i });
        fireEvent.click(gpsToggle);
        expect(screen.getByText('Rit is actief')).toBeDefined();

        fireEvent.click(screen.getByRole('button', { name: /GPS Pauzeren/i }));
        expect(screen.getByText('Rit gepauzeerd')).toBeDefined();

        // Wissel naar Kaart & Route tab en open stop via markerklik
        fireEvent.click(screen.getByRole('button', { name: /Kaart & Route/i }));
        const overviewMap = screen.getByTestId('route-map');
        expect(overviewMap.getAttribute('data-min-height')).toBe('440px');
        fireEvent.click(overviewMap);

        // Bezorgscherm is geopend voor de aangeklikte stop zonder vorige stop
        expect(screen.getByText(/Bestemming: Stop #1/i)).toBeDefined();

        // Terug naar stoppenlijst en terug naar routeoverzicht
        fireEvent.click(screen.getByRole('button', { name: /Terug naar stoppenlijst/i }));
        fireEvent.click(screen.getByRole('button', { name: /Kies een andere route/i }));
        expect(screen.getByText('Toegewezen Routes')).toBeDefined();
    });

    it('UT-ROUTEVIEW-05: Beheert profielfoto upload, localStorage, foutmeldingen en image fallback', async () => {
        localStorage.setItem('fleethub_avatar', 'https://cdn.fleethub.nl/stored-avatar.png');
        const { container, rerender } = render(<RouteView />);

        const avatarImg = screen.getByAltText('John Doe');
        expect(avatarImg.getAttribute('src')).toBe('https://cdn.fleethub.nl/stored-avatar.png');

        // Prop avatarUrl overschrijft localStorage
        rerender(
            <RouteView
                currentUser={{
                    fullName: 'Lisa Vermeulen',
                    avatarUrl: 'https://cdn.fleethub.nl/lisa.png'
                }}
            />
        );
        const lisaImg = screen.getByAltText('Lisa Vermeulen');
        expect(lisaImg.getAttribute('src')).toBe('https://cdn.fleethub.nl/lisa.png');

        // Klik op profielknop en simuleer succesvolle upload
        fireEvent.click(screen.getByRole('button', { name: /Profielfoto wijzigen/i }));
        const fileInput = container.querySelector('input[type="file"]');

        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ avatarUrl: 'https://cdn.fleethub.nl/uploaded.png' })
        });

        const validFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        await waitFor(() => {
            expect(screen.getByAltText('Lisa Vermeulen').getAttribute('src')).toBe(
                'https://cdn.fleethub.nl/uploaded.png'
            );
            expect(localStorage.getItem('fleethub_avatar')).toBe('https://cdn.fleethub.nl/uploaded.png');
        });

        // Simuleer gefaalde upload met JSON foutboodschap
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Bestand te groot' })
        });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                'Fout bij uploaden profielfoto: Bestand te groot'
            );
        });

        // Simuleer lege bestandsselectie (geannuleerd)
        fireEvent.change(fileInput, { target: { files: [] } });

        // Simuleer onError op de profielafbeelding
        fireEvent.error(screen.getByAltText('Lisa Vermeulen'));
        expect(screen.getByAltText('Lisa Vermeulen').getAttribute('src')).toBeTruthy();
    });
});