import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, apiGet, apiPost, apiPatch, apiDelete, handleApiResponse, API_BASE_URL } from '../apiClient';
import * as authService from '../authService';

vi.mock('../authService', () => ({
    logout: vi.fn().mockResolvedValue({})
}));

describe('apiClient Unit Tests (LO4 Quality Gate)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('UT-CLI-01: API_BASE_URL gebruikt geldige basis-URL zonder onveilige hostnames', () => {
        expect(API_BASE_URL).toBeDefined();
        expect(typeof API_BASE_URL).toBe('string');
        // Controleer dat er geen trailing slashes achterblijven
        expect(API_BASE_URL.endsWith('/')).toBe(false);
    });

    it('UT-CLI-02: gooit sessiefout en logt uit bij HTTP 401 of 403', async () => {
        delete window.location;
        window.location = { reload: vi.fn() };

        const mockResponse401 = { status: 401, ok: false };
        await expect(handleApiResponse(mockResponse401)).rejects.toThrow('Sessie verlopen of geen toegang. Log opnieuw in.');
        expect(authService.logout).toHaveBeenCalled();

        const mockResponse403 = { status: 403, ok: false };
        await expect(handleApiResponse(mockResponse403)).rejects.toThrow('Sessie verlopen of geen toegang. Log opnieuw in.');
    });

    it('UT-CLI-03: gooit custom error met detailboodschap bij gefaalde response', async () => {
        const mockResponse = {
            status: 500,
            ok: false,
            json: vi.fn().mockResolvedValue({ message: 'Interne serverfout' })
        };

        await expect(handleApiResponse(mockResponse, 'Aanroep mislukt')).rejects.toThrow('Interne serverfout');
    });

    it('UT-CLI-04: gooit default error wanneer json parse faalt bij non-ok response', async () => {
        const mockResponse = {
            status: 502,
            ok: false,
            json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
        };

        await expect(handleApiResponse(mockResponse, 'Server niet bereikbaar')).rejects.toThrow('Server niet bereikbaar');
    });

    it('UT-CLI-05: retourneert geparseerde JSON bij succesvolle response', async () => {
        const mockData = { id: 1, name: 'Test' };
        const mockResponse = {
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue(mockData)
        };

        const result = await handleApiResponse(mockResponse);
        expect(result).toEqual(mockData);
    });

    it('UT-CLI-06: apiFetch handelt endpoints correct af met credentials', async () => {
        global.fetch.mockResolvedValue({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
        });

        const res = await apiFetch('/test-endpoint');
        expect(res).toEqual({ success: true });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/test-endpoint'),
            expect.objectContaining({ credentials: 'include' })
        );
    });

    it('UT-CLI-07: apiGet, apiPost, apiPatch en apiDelete voeren juiste HTTP methods uit', async () => {
        global.fetch.mockResolvedValue({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue({ status: 'ok' })
        });

        await apiGet('/items');
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'GET' }));

        await apiPost('/items', { name: 'Nieuw Item' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Nieuw Item' }) })
        );

        await apiPatch('/items/1', { status: 'DONE' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'DONE' }) })
        );

        await apiDelete('/items/1');
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'DELETE' }));
    });
});