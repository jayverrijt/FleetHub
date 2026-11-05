import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout, getCurrentUser } from '../authService';

describe('authService Unit Tests (LO4 Quality Gate)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('UT-FE-AUTH-01: slaat profielgegevens op bij succesvolle login', async () => {
        const mockUser = { userId: 1, fullName: 'Jan de Vries', role: 'ROLE_COURIER' };
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser
        });

        const result = await login('driver1@fleethub.nl', 'password123');

        expect(result).toEqual(mockUser);
        expect(JSON.parse(localStorage.getItem('fleethub_user'))).toEqual(mockUser);
    });

    it('UT-FE-AUTH-02: gooit een foutmelding bij afgewezen credentials', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Onjuiste inloggegevens' })
        });

        await expect(login('bad@fleethub.nl', 'wrong')).rejects.toThrow('Onjuiste inloggegevens');
    });

    it('UT-FE-AUTH-03: gooit default error als server geen json foutmelding geeft', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => { throw new Error('Geen json'); }
        });

        await expect(login('bad@fleethub.nl', 'wrong')).rejects.toThrow('Inloggen mislukt');
    });

    it('UT-FE-AUTH-04: logout wist fleethub_user zelfs wanneer netwerkcall faalt', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorage.setItem('fleethub_user', JSON.stringify({ userId: 1 }));
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network Down'));

        await logout();

        expect(warnSpy).toHaveBeenCalled();
        expect(localStorage.getItem('fleethub_user')).toBeNull();
    });

    it('UT-FE-AUTH-05: getCurrentUser retourneert geparseerde gebruiker of null bij corrupte JSON', () => {
        expect(getCurrentUser()).toBeNull();

        localStorage.setItem('fleethub_user', JSON.stringify({ fullName: 'Jan' }));
        expect(getCurrentUser()).toEqual({ fullName: 'Jan' });

        localStorage.setItem('fleethub_user', 'corrupt_json_{{');
        expect(getCurrentUser()).toBeNull();
    });
});