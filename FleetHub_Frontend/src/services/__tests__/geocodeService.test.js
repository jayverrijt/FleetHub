import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeAddress } from '../geocodeService';

describe('geocodeService Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-GEO-01: geocodeert een geldig adres succesvol via Nominatim', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '51.4416', lon: '5.4697' }]
        });

        const coords = await geocodeAddress('Rachelsmolen 1', 'Eindhoven');
        expect(coords).toEqual([51.4416, 5.4697]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('UT-GEO-02: parseert coördinaten als floats', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '52.3676', lon: '4.9041' }]
        });

        const coords = await geocodeAddress('Dam 1', 'Amsterdam');
        expect(coords[0]).toBe(52.3676);
        expect(coords[1]).toBe(4.9041);
    });

    it('UT-GEO-03: valt terug op stadsniveau als specifiek adres geen resultaten oplevert', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => []
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '51.4408', lon: '5.4778' }]
            });

        const coords = await geocodeAddress('OnbekendeStraat 999', 'Eindhoven');
        expect(coords).toEqual([51.4408, 5.4778]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('UT-GEO-04: hanteert netwerkfout bij primair adres en slaagt via stadsfallback', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        global.fetch = vi.fn()
            .mockRejectedValueOnce(new Error('Netwerk timeout'))
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '52.3676', lon: '4.9041' }]
            });

        const coords = await geocodeAddress('FoutieveStraat 12', 'Amsterdam');

        expect(coords).toEqual([52.3676, 4.9041]);
        warnSpy.mockRestore();
    });

    it('UT-GEO-05: retourneert standaard Eindhoven centrum coördinaten als alle providers en fallbacks falen', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

        const coords = await geocodeAddress('NietBestaand 404', 'OnbekendeStad');

        expect(coords).toEqual([51.4416, 5.4697]);
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });
});