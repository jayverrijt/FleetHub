import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geocodeAddress } from '../geocodeService';

describe('geocodeService Unit Tests (LO4 Quality & Coverage)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        global.fetch = vi.fn();
    });

    it('UT-GEO-01: zet adres en stad succesvol om naar GPS-coördinaten via primair adres', async () => {
        const mockNominatimData = [
            { lat: '51.4518', lon: '5.4815' }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNominatimData
        });

        const coords = await geocodeAddress('Rachelsmolen 1', 'Eindhoven');

        expect(coords).toEqual([51.4518, 5.4815]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('Rachelsmolen%201%2C%20Eindhoven%2C%20Netherlands'),
            expect.objectContaining({
                headers: expect.objectContaining({ 'User-Agent': 'FleetHub-DriverApp/1.0' })
            })
        );
    });

    it('UT-GEO-02: retourneert gecachete coördinaten zonder extra netwerkverzoek', async () => {
        // Zelfde query als UT-GEO-01 wordt direct uit de geocodeCache gehaald
        const cachedCoords = await geocodeAddress('Rachelsmolen 1', 'Eindhoven');

        expect(cachedCoords).toEqual([51.4518, 5.4815]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('UT-GEO-03: valt terug op stadsnaam als specifiek straatadres niet wordt gevonden', async () => {
        // 1e fetch (volledig adres) levert lege array op
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        // 2e fetch (fallback stad) levert coördinaten op
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '51.9244', lon: '4.4777' }]
        });

        const coords = await geocodeAddress('OnbekendeStraat 999', 'Rotterdam');

        expect(coords).toEqual([51.9244, 4.4777]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenLastCalledWith(
            expect.stringContaining('Rotterdam%2C%20Netherlands'),
            expect.any(Object)
        );
    });

    it('UT-GEO-04: hanteert netwerkfout bij primair adres en slaagt via stadsfallback', async () => {
        // 1e fetch faalt met netwerkfout
        global.fetch.mockRejectedValueOnce(new Error('Netwerk timeout'));

        // 2e fetch slaagt op stadsniveau
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ lat: '52.3676', lon: '4.9041' }]
        });

        const coords = await geocodeAddress('FoutieveStraat 12', 'Amsterdam');

        expect(coords).toEqual([52.3676, 4.9041]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('UT-GEO-05: retourneert standaard Eindhoven centrum coördinaten als alle providers en fallbacks falen', async () => {
        // Zowel adres als stad leveren een netwerkfout op
        global.fetch.mockRejectedValue(new Error('Offline'));

        const coords = await geocodeAddress('NietBestaand 404', 'OnbekendeStad');

        expect(coords).toEqual([51.4416, 5.4697]);
    });
});