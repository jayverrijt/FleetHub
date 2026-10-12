const geocodeCache = new Map();

/**
 * Skakel 'n adres en stad om na [latitude, longitude] via OpenStreetMap Nominatim.
 * @param {string} address
 * @param {string} city
 * @returns {Promise<[number, number]>}
 */
export async function geocodeAddress(address, city) {
    const query = `${address}, ${city}, Netherlands`;

    if (geocodeCache.has(query)) {
        return geocodeCache.get(query);
    }

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
                const firstResult = data[0];
                const lat = parseFloat(firstResult['lat']);
                const lon = parseFloat(firstResult['lon']);
                if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                    const coords = [lat, lon];
                    geocodeCache.set(query, coords);
                    return coords;
                }
            }
        }
    } catch (error) {
        console.warn(`Kon adres nie dinamies geokodeer nie (${query}):`, error);
    }

    // Terugval-opsie: soek slegs op die stadsnaam indien die straat nie gevind word nie
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
                const fallbackItem = cityData[0];
                const fallbackLat = parseFloat(fallbackItem['lat']);
                const fallbackLon = parseFloat(fallbackItem['lon']);
                if (!Number.isNaN(fallbackLat) && !Number.isNaN(fallbackLon)) {
                    const fallbackCoords = [fallbackLat, fallbackLon];
                    geocodeCache.set(query, fallbackCoords);
                    return fallbackCoords;
                }
            }
        }
    } catch (e) {
        console.error('Terugval-geokodering het misluk:', e);
    }

    // Verstekkoördinate vir Eindhoven indien alle oproepe misluk
    return [51.4416, 5.4697];
}