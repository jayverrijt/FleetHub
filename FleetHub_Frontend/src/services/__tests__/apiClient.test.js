import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, apiGet, apiPost, apiPatch, apiDelete, handleApiResponse } from '../apiClient';
import * as authService from '../authService';

vi.mock('../authService', () => ({
    logout: vi.fn()
}));

describe('apiClient Unit Tests (LO4 Quality Gate)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('UT-CLI-01: gooit sessiefout en logt uit bij HTTP 401 of 403', async () => {
        delete window.location;
        window.location = { reload: vi.fn() };

        const mockResponse401 = { status: 401, ok: false };
        await expect(handleApiResponse(mockResponse401)).rejects.toThrow('Sessie verlopen of geen toegang. Log opnieuw in.');
        expect(authService.logout).toHaveBeenCalled();

        const mockResponse403 = { status: 403, ok: false };
        await expect(handleApiResponse(mockResponse403)).rejects.toThrow('Sessie verlopen of geen toegang. Log opnieuw in.');
    });

    it('UT-CLI-02: gooit custom error met statuscode bij gefaalde response', async () => {
        const mockResponse = {
            status: 500,
            ok: false,
            json: vi.fn().mockResolvedValue({ message: 'Interne serverfout' })
        };

        await expect(handleApiResponse(mockResponse, 'Aanroep mislukt')).rejects.toThrow('Interne serverfout');
    });

    it('UT-CLI-03: gooit default error wanneer json parse faalt bij non-ok response', async () => {
        const mockResponse = {
            status: 502,
            ok: false,
            json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
        };

        await expect(handleApiResponse(mockResponse, 'Server niet bereikbaar')).rejects.toThrow('Server niet bereikbaar (HTTP 502)');
    });

    it('UT-CLI-04: retourneert null bij HTTP 204 No Content', async () => {
        const mockResponse = {
            status: 204,
            ok: true
        };

        const result = await handleApiResponse(mockResponse);
        expect(result).toBeNull();
    });

    it('UT-CLI-05: apiFetch handelt absolute URLs en relatieve endpoints af', async () => {
        global.fetch.mockResolvedValue({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
        });

        const resRelative = await apiFetch('/test-endpoint');
        expect(resRelative).toEqual({ success: true });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/test-endpoint'),
            expect.objectContaining({ credentials: 'include' })
        );

        const resAbsolute = await apiFetch('http://custom-url.local/api/test');
        expect(resAbsolute).toEqual({ success: true });
    });

    it('UT-CLI-06: apiGet, apiPost, apiPatch en apiDelete voeren juiste HTTP methods uit', async () => {
        global.fetch.mockResolvedValue({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue({ status: 'ok' })
        });

        await apiGet('/items');
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'GET' }));

        await apiPost('/items', { name: 'Item 1' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Item 1' }) })
        );

        await apiPatch('/items/1', { name: 'Updated' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Updated' }) })
        );

        await apiDelete('/items/1');
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'DELETE' }));
    });
});