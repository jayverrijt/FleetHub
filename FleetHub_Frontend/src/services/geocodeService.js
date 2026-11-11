const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_COORDINATES = [51.4416, 5.4697];

/**
 * Hulpfunctie om Nominatim query uit te voeren en te parsen zonder codeduplicatie.
 */
async function fetchCoordinates(queryParams) {
    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}?format=json&${queryParams}`);
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const lat = Number.parseFloat(data[0].lat);
            const lon = Number.parseFloat(data[0].lon);

            if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                return [lat, lon];
            }
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Converteert een adres en woonplaats naar GPS coördinaten via OpenStreetMap Nominatim.
 */
export async function geocodeAddress(address, city) {
    const query = `q=${encodeURIComponent(`${address}, ${city}, Netherlands`)}`;
    const coords = await fetchCoordinates(query);

    if (coords) {
        return coords;
    }

    // Fallback op stadsniveau
    const cityQuery = `city=${encodeURIComponent(city)}&country=Netherlands`;
    const cityCoords = await fetchCoordinates(cityQuery);

    return cityCoords || DEFAULT_COORDINATES;
}