import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeAddress } from '../geocodeService';

describe('geocodeService Unit Tests (LO4 Quality & Robuustheid)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UT-GEO-01: Geocodeert een geldig adres succesvol via Nominatim', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '51.4416', lon: '5.4697' }]
        });

        const coords = await geocodeAddress('Rachelsmolen 1', 'Eindhoven');
        expect(coords).toEqual([51.4416, 5.4697]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('Rachelsmolen%201%2C%20Eindhoven%2C%20Netherlands')
        );
    });

    it('UT-GEO-02: Parseert string-coördinaten betrouwbaar naar floating point nummers', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '52.3676', lon: '4.9041' }]
        });

        const coords = await geocodeAddress('Dam 1', 'Amsterdam');
        expect(coords[0]).toBe(52.3676);
        expect(coords[1]).toBe(4.9041);
    });

    it('UT-GEO-03: Valt terug op stadsniveau als adres een lege lijst oplevert', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => []
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '51.4408', lon: '5.4778' }]
            });

        const coords = await geocodeAddress('NietBestaand 999', 'Eindhoven');
        expect(coords).toEqual([51.4408, 5.4778]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenLastCalledWith(
            expect.stringContaining('city=Eindhoven')
        );
    });

    it('UT-GEO-04: Hanteert response ok === false bij adres en slaagt via stadsfallback', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: false,
                status: 500
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '52.3676', lon: '4.9041' }]
            });

        const coords = await geocodeAddress('FoutieveStraat 12', 'Amsterdam');
        expect(coords).toEqual([52.3676, 4.9041]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('UT-GEO-05: Negeert NaN-coördinaten en schakelt door naar stadsfallback', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: 'geen_getal', lon: '5.4697' }]
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '51.4416', lon: '5.4697' }]
            });

        const coords = await geocodeAddress('VreemdeData 1', 'Eindhoven');
        expect(coords).toEqual([51.4416, 5.4697]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('UT-GEO-06: Retourneert standaard Eindhoven centrum coördinaten als fetch exception gooit', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Netwerk offline'));

        const coords = await geocodeAddress('Onbekend 404', 'OnbekendeStad');
        expect(coords).toEqual([51.4416, 5.4697]);
    });
});