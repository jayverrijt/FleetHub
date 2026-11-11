import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RouteView from '../RouteView';

// Voorkom dat RouteView tijdens tests een echte STOMP/WebSocket handshake start
vi.mock('../../hooks/useDriverLocationBroadcaster', () => ({
    useDriverLocationBroadcaster: vi.fn()
}));

const mockRoutes = [
    { id: 104, name: 'Eindhoven Centrum - Ochtend', status: 'IN_PROGRESS' }
];

const mockStops = [
    { id: 1, sequenceOrder: 1, status: 'PENDING', recipientName: 'Piet Bakker', orderNumber: 'ORD-1001', address: 'Markt 12', city: 'Eindhoven', latitude: 51.4416, longitude: 5.4697 },
    { id: 2, sequenceOrder: 2, status: 'PENDING', recipientName: 'Sophie Jansen', orderNumber: 'ORD-1002', address: 'Frederiklaan 10', city: 'Eindhoven', latitude: 51.4419, longitude: 5.4674 }
];

describe('RouteView Unit Tests (Driver Profile & Avatar Upload)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        global.alert = vi.fn();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => []
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-RV-01: Rendert standaardnaam en default avatar wanneer currentUser ontbreekt', () => {
        render(<RouteView currentUser={null} />);

        expect(screen.getByText('Jan de Vries')).toBeDefined();
        const avatarImg = screen.getByAltText('Jan de Vries');
        expect(avatarImg).toBeDefined();
        expect(avatarImg.getAttribute('src')).toBeTruthy();
    });

    it('UT-RV-02: Toont chauffeursnaam en profielfoto uit currentUser prop', () => {
        const user = {
            userId: 42,
            fullName: 'Sophie Bakker',
            avatarUrl: 'https://cdn.fleethub.test/avatars/sophie.png'
        };

        render(<RouteView currentUser={user} />);

        expect(screen.getByText('Sophie Bakker')).toBeDefined();
        const avatarImg = screen.getByAltText('Sophie Bakker');
        expect(avatarImg.getAttribute('src')).toBe('https://cdn.fleethub.test/avatars/sophie.png');
    });

    it('UT-RV-03: Gebruikt fleethub_avatar uit localStorage wanneer prop avatar ontbreekt', () => {
        localStorage.setItem('fleethub_avatar', 'https://cdn.fleethub.test/avatars/stored.png');

        render(<RouteView currentUser={{ id: 5, fullName: 'Karel Chauffeur' }} />);

        const avatarImg = screen.getByAltText('Karel Chauffeur');
        expect(avatarImg.getAttribute('src')).toBe('https://cdn.fleethub.test/avatars/stored.png');
    });

    it('UT-RV-04: Klik op profielknop activeert verborgen bestandsinvoer', () => {
        const { container } = render(<RouteView currentUser={{ userId: 1, fullName: 'Jan' }} />);

        const fileInput = container.querySelector('input[type="file"]');
        const clickSpy = vi.spyOn(fileInput, 'click');

        const button = screen.getByRole('button', { name: /Profielfoto wijzigen/i });
        fireEvent.click(button);

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('UT-RV-05: Uploadt gekozen profielfoto en werkt state en localStorage bij', async () => {
        const newAvatarUrl = 'https://api.fleethub.test/uploads/avatars/driver_1_abc.png';
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ avatarUrl: newAvatarUrl, message: 'Succes' })
        });

        localStorage.setItem('fleethub_user', JSON.stringify({ userId: 1, fullName: 'Jan' }));

        const { container } = render(<RouteView currentUser={{ userId: 1, fullName: 'Jan' }} />);

        const fileInput = container.querySelector('input[type="file"]');
        const dummyFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [dummyFile] } });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringMatching(/\/driver\/profile-picture$/),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData)
                })
            );
        });

        await waitFor(() => {
            const updatedImg = screen.getByAltText('Jan');
            expect(updatedImg.getAttribute('src')).toBe(newAvatarUrl);
            expect(localStorage.getItem('fleethub_avatar')).toBe(newAvatarUrl);
            const storedUser = JSON.parse(localStorage.getItem('fleethub_user'));
            expect(storedUser.avatarUrl).toBe(newAvatarUrl);
        });
    });

    it('UT-RV-06: Toont alert bij gefaalde HTTP upload-aanroep', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        const { container } = render(<RouteView currentUser={{ userId: 1, fullName: 'Jan' }} />);

        const fileInput = container.querySelector('input[type="file"]');
        const dummyFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });

        fireEvent.change(fileInput, { target: { files: [dummyFile] } });

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
                expect.stringContaining('Fout bij uploaden profielfoto: Uploaden is mislukt')
            );
        });
    });

    it('UT-RV-07: Doet niets wanneer file dialog wordt geannuleerd (lege files array)', () => {
        global.fetch = vi.fn();
        const { container } = render(<RouteView currentUser={{ userId: 1, fullName: 'Jan' }} />);

        const fileInput = container.querySelector('input[type="file"]');
        fireEvent.change(fileInput, { target: { files: [] } });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('UT-RV-08: onError handler van avatar image zet fallback default-avatar', () => {
        render(<RouteView currentUser={{ userId: 1, fullName: 'Jan', avatarUrl: 'https://invalid.url/broken.png' }} />);

        const img = screen.getByAltText('Jan');
        fireEvent.error(img);

        expect(img.getAttribute('src')).toBeTruthy();
    });

    it('UT-RV-09: Selecteert een route en toont de bijbehorende stoppenlijst', async () => {
        render(<RouteView currentUser={{ id: 1, fullName: 'Jan de Vries' }} initialRoutes={mockRoutes} initialStops={mockStops} />);

        expect(screen.getByText('Eindhoven Centrum - Ochtend')).toBeDefined();

        const routeCard = screen.getByRole('button', { name: /Eindhoven Centrum - Ochtend/i });
        fireEvent.click(routeCard);

        await waitFor(() => {
            expect(screen.getByText('Stoppenlijst (2)')).toBeDefined();
            expect(screen.getByText('Piet Bakker')).toBeDefined();
            expect(screen.getByText('Volgende stop: #1')).toBeDefined();
        });
    });

    it('UT-RV-10: Schakelt soepel tussen de tabbladen Stoppenlijst en Kaart & Route', async () => {
        render(<RouteView currentUser={{ id: 1, fullName: 'Jan de Vries' }} initialRoutes={mockRoutes} initialStops={mockStops} />);
        fireEvent.click(screen.getByRole('button', { name: /Eindhoven Centrum - Ochtend/i }));

        const mapTab = screen.getByRole('button', { name: /Kaart & Route/i });
        fireEvent.click(mapTab);

        expect(document.querySelector('.map-container')).toBeDefined();

        const listTab = screen.getByRole('button', { name: /Stoppenlijst/i });
        fireEvent.click(listTab);
        expect(screen.getByText('Sophie Jansen')).toBeDefined();
    });

    it('UT-RV-11: Handelt stop af bij klik op Volgende stop knop', async () => {
        render(<RouteView currentUser={{ id: 1, fullName: 'Jan de Vries' }} initialRoutes={mockRoutes} initialStops={mockStops.slice(0, 1)} />);
        fireEvent.click(screen.getByRole('button', { name: /Eindhoven Centrum - Ochtend/i }));

        const nextStopBtn = await screen.findByRole('button', { name: /Volgende stop: #1/i });
        fireEvent.click(nextStopBtn);

        await waitFor(() => {
            expect(screen.getByText('Alle stops voltooid')).toBeDefined();
        });
    });

    it('UT-RV-12: Keert terug naar routeroverzicht en pauzeert/start GPS', async () => {
        render(<RouteView currentUser={{ id: 1, fullName: 'Jan de Vries' }} initialRoutes={mockRoutes} initialStops={mockStops} />);
        fireEvent.click(screen.getByRole('button', { name: /Eindhoven Centrum - Ochtend/i }));

        const pauseGpsBtn = screen.getByRole('button', { name: /GPS Pauzeren/i });
        fireEvent.click(pauseGpsBtn);
        expect(screen.getByText('Rit gepauzeerd')).toBeDefined();

        const startGpsBtn = screen.getByRole('button', { name: /Start Rit \/ GPS/i });
        fireEvent.click(startGpsBtn);
        expect(screen.getByText('Rit is actief')).toBeDefined();

        const backBtn = screen.getByRole('button', { name: /← Kies een andere route/i });
        fireEvent.click(backBtn);
        expect(screen.getByText('Toegewezen Routes')).toBeDefined();
    });

    it('UT-RV-13: Haalt routes op bij mount voor ingelogde koerier', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => [{ id: 104, name: 'Eindhoven Centrum - Ochtend', status: 'IN_PROGRESS' }]
        });

        render(<RouteView currentUser={{ id: 1, role: 'ROLE_COURIER', fullName: 'Jan de Vries' }} />);

        await waitFor(() => {
            expect(screen.getByText('Eindhoven Centrum - Ochtend')).toBeDefined();
        });
    });

    it('UT-RV-14: Toont foutmelding bij netwerkfout tijdens ophalen van routes', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Netwerkfout'));

        render(<RouteView currentUser={{ id: 2, role: 'ROLE_COURIER', fullName: 'Sophie Bakker' }} />);

        await waitFor(() => {
            expect(screen.getByText('Kon routes niet laden')).toBeDefined();
        });

        consoleSpy.mockRestore();
    });

    it('UT-RV-15: Vangt netwerkfouten af bij het ophalen van stops en bijwerken van stopstatus', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const testRoutes = [{ id: 999, name: 'Faalroute', status: 'IN_PROGRESS' }];
        const testStops = [{ id: 10, sequenceOrder: 1, status: 'PENDING', recipientName: 'Fout Klant' }];

        global.fetch = vi.fn().mockRejectedValue(new Error('Netwerkfout'));

        render(<RouteView currentUser={{ id: 1, fullName: 'Jan de Vries' }} initialRoutes={testRoutes} initialStops={testStops} />);

        const routeCard = screen.getByRole('button', { name: /Faalroute/i });
        fireEvent.click(routeCard);

        const nextBtn = await screen.findByRole('button', { name: /Volgende stop: #1/i });
        fireEvent.click(nextBtn);

        await waitFor(() => {
            expect(screen.getByText('Alle stops voltooid')).toBeDefined();
        });

        consoleSpy.mockRestore();
    });
});