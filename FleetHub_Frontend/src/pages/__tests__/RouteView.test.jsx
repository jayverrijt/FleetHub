import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RouteView from '../RouteView';

describe('RouteView Unit Tests (Driver Profile & Avatar Upload)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        global.alert = vi.fn();
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
});