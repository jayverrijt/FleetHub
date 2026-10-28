const geocodeCache = new Map();

/**
 * Zet een adres en stad om naar [latitude, longitude] via OpenStreetMap Nominatim.
 * @param {string} address
 * @param {string} city
 * @returns {Promise<[number, number]>}
 */
export async function geocodeAddress(address, city) {
    const query = `${address}, ${city}, Netherlands`;

    if (geocodeCache.has(query)) {
        return geocodeCache.get(query);
    }

    // 1. Zoek primair op volledig adres
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'FleetHub-DriverApp/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const first = data[0];
                const lat = parseFloat(first['lat']);
                const lon = parseFloat(first['lon']);
                if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                    const coords = [lat, lon];
                    geocodeCache.set(query, coords);
                    return coords;
                }
            }
        }
    } catch (error) {
        console.warn(`Adres kon niet direct geocodeerd worden (${query}):`, error);
    }

    // 2. Fallback: zoek uitsluitend op stadsnaam indien straat niet gevonden wordt
    try {
        const cityUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', Netherlands')}&limit=1`;
        const cityRes = await fetch(cityUrl, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'FleetHub-DriverApp/1.0'
            }
        });

        if (cityRes.ok) {
            const cityData = await cityRes.json();
            if (Array.isArray(cityData) && cityData.length > 0) {
                const fallback = cityData[0];
                const fallbackLat = parseFloat(fallback['lat']);
                const fallbackLon = parseFloat(fallback['lon']);
                if (!Number.isNaN(fallbackLat) && !Number.isNaN(fallbackLon)) {
                    const fallbackCoords = [fallbackLat, fallbackLon];
                    geocodeCache.set(query, fallbackCoords);
                    return fallbackCoords;
                }
            }
        }
    } catch (e) {
        console.error('Fallback-geocodering op stadsniveau mislukt:', e);
    }

    // 3. Standaard coördinaten (Centrum Eindhoven) als alle verzoeken falen
    return [51.4416, 5.4697];
}