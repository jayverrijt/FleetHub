import { useState, useEffect, useRef } from 'react';
import { useDriverLocationBroadcaster } from '../hooks/useDriverLocationBroadcaster';
import * as stopService from '../services/stopService';
import { API_BASE_URL } from '../services/apiClient';
import RouteMap from '../components/RouteMap';
import StopList from '../components/StopList';
import defaultAvatar from '../assets/default-avatar.svg';

const DEFAULT_ROUTES = [
    { id: 104, name: 'Route #104 - Eindhoven & Helmond', status: 'IN_PROGRESS' },
    { id: 105, name: 'Helmond West - Middag', status: 'PLANNED' }
];

const DEFAULT_STOPS_MAP = {
    104: [
        { id: 1, sequenceOrder: 1, status: 'DELIVERED', recipientName: 'Piet Bakker', orderNumber: 'ORD-1001', address: 'Markt 12', city: 'Eindhoven', latitude: 51.4416, longitude: 5.4697 },
        { id: 2, sequenceOrder: 2, status: 'DELIVERED', recipientName: 'Jan de Vries', orderNumber: 'ORD-1002', address: 'Rachelsmolen 1', city: 'Eindhoven', latitude: 51.4518, longitude: 5.4815 },
        { id: 3, sequenceOrder: 3, status: 'DELIVERED', recipientName: 'Senkaya Logistics', orderNumber: 'ORD-1004-SENKAYA', address: 'Marconilaan 23-B', city: 'Eindhoven', latitude: 51.4485, longitude: 5.4632 },
        { id: 4, sequenceOrder: 4, status: 'DELIVERED', recipientName: 'Klant Picnic Helmond', orderNumber: 'ORD-TEST-PICNICHLM', address: 'Duizeldonksestraat 15', city: 'Helmond', latitude: 51.4712, longitude: 5.6418 },
        { id: 5, sequenceOrder: 5, status: 'PENDING', recipientName: 'Jay Verrijt', orderNumber: 'ORD-1003', address: 'Kievitstraat 36', city: 'Helmond', latitude: 51.4824, longitude: 5.6612 }
    ],
    105: [
        { id: 6, sequenceOrder: 1, status: 'PENDING', recipientName: 'Daan Peters', orderNumber: 'ORD-2001', address: 'Heuvelstraat 42', city: 'Tilburg', latitude: 51.5562, longitude: 5.0864 },
        { id: 7, sequenceOrder: 2, status: 'PENDING', recipientName: 'Emma Hermans', orderNumber: 'ORD-2002', address: 'Kerkstraat 8', city: 'Veldhoven', latitude: 51.4182, longitude: 5.4042 }
    ]
};

// Berekent afstand (km) en geschatte rijtijd (minuten) tussen twee stops via Haversine-formule
function calculateTravelEstimate(fromStop, toStop) {
    if (!fromStop?.latitude || !fromStop?.longitude || !toStop?.latitude || !toStop?.longitude) {
        return { minutes: 8, distanceKm: null };
    }

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Straal van de aarde in km
    const dLat = toRad(toStop.latitude - fromStop.latitude);
    const dLon = toRad(toStop.longitude - fromStop.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(fromStop.latitude)) *
        Math.cos(toRad(toStop.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Hemelsbrede afstand * 1.25 omrijfactor, gemiddeld 40 km/u + 2 min parkeren/lopen
    const roadDistanceKm = Math.max(0.4, R * c * 1.25);
    const estimatedMinutes = Math.max(3, Math.round((roadDistanceKm / 40) * 60 + 2));

    return {
        minutes: estimatedMinutes,
        distanceKm: roadDistanceKm.toFixed(1)
    };
}

export default function RouteView({
                                      currentUser,
                                      initialRoutes = DEFAULT_ROUTES,
                                      initialStops = DEFAULT_STOPS_MAP[104]
                                  }) {
    const driverId = currentUser?.userId || currentUser?.id || 1;
    const driverName = currentUser?.fullName || 'John Doe';
    const [routes, setRoutes] = useState(initialRoutes);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState(initialStops);
    const [activeTab, setActiveTab] = useState('LIST'); // 'LIST' of 'MAP'
    const [focusedStopId, setFocusedStopId] = useState(null);
    const [isStreamingActive, setIsStreamingActive] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const fileInputRef = useRef(null);

    const [avatarSrc, setAvatarSrc] = useState(
        () => currentUser?.avatarUrl || localStorage.getItem('fleethub_avatar') || defaultAvatar
    );

    useDriverLocationBroadcaster(isStreamingActive);

    useEffect(() => {
        if (currentUser?.avatarUrl) {
            setAvatarSrc(currentUser.avatarUrl);
        } else {
            const stored = localStorage.getItem('fleethub_avatar');
            setAvatarSrc(stored || defaultAvatar);
        }
    }, [currentUser]);

    useEffect(() => {
        let isMounted = true;
        if (typeof stopService.fetchDriverRoutes === 'function') {
            stopService
                .fetchDriverRoutes(driverId)
                .then((data) => {
                    if (isMounted && Array.isArray(data) && data.length > 0) {
                        setRoutes(data);
                    }
                })
                .catch(() => {
                    // Behoud initialRoutes bij offline/testomgeving
                });
        }
        return () => {
            isMounted = false;
        };
    }, [driverId]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/driver/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response || !response.ok) {
                let errorMessage = 'Uploaden is mislukt';
                if (response && typeof response.json === 'function') {
                    const errorData = await response.json().catch(() => ({}));
                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = typeof response.json === 'function' ? await response.json() : {};
            const newUrl = data.avatarUrl || data.url;
            if (newUrl) {
                setAvatarSrc(newUrl);
                localStorage.setItem('fleethub_avatar', newUrl);
                const storedUser = JSON.parse(localStorage.getItem('fleethub_user') || '{}');
                storedUser.avatarUrl = newUrl;
                localStorage.setItem('fleethub_user', JSON.stringify(storedUser));
            }
        } catch (err) {
            alert(`Fout bij uploaden profielfoto: ${err.message}`);
        }
    };

    const handleSelectRoute = async (route) => {
        setSelectedRoute(route);
        setActiveTab('LIST');
        setFocusedStopId(null);
        setIsStreamingActive(route.status === 'IN_PROGRESS');
        try {
            if (typeof stopService.fetchStopsForRoute === 'function') {
                const data = await stopService.fetchStopsForRoute(route.id);
                if (Array.isArray(data) && data.length > 0) {
                    setStops([...data].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0)));
                    return;
                }
            }
        } catch {
            // Fallback naar lokale seed
        }
        setStops(DEFAULT_STOPS_MAP[route.id] || DEFAULT_STOPS_MAP[104]);
    };

    const handleStatusUpdate = async (stopId, newStatus) => {
        setUpdatingId(stopId);
        try {
            if (typeof stopService.updateStopStatus === 'function') {
                await stopService.updateStopStatus(stopId, newStatus);
            }
        } catch {
            // Lokale state bijwerken als backend niet bereikbaar is
        }

        const updatedStops = stops.map((s) => (s.id === stopId ? { ...s, status: newStatus } : s));
        setStops(updatedStops);
        setUpdatingId(null);

        if (focusedStopId === stopId) {
            const nextOpenStop = updatedStops.find((s) => s.status === 'PENDING');
            setFocusedStopId(nextOpenStop ? nextOpenStop.id : null);
        }
    };

    const sortedStops = [...stops].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
    const nextPendingStop = sortedStops.find((s) => s.status === 'PENDING');
    const focusedStop = sortedStops.find((s) => s.id === focusedStopId) || null;

    // Bepaal de vorige stop voor de kaart (van vorige stop -> huidige stop) en reistijd
    const focusedIndex = focusedStop ? sortedStops.findIndex((s) => s.id === focusedStop.id) : -1;
    const previousStop = focusedIndex > 0 ? sortedStops[focusedIndex - 1] : null;
    const legMapStops = focusedStop
        ? (previousStop ? [previousStop, focusedStop] : [focusedStop])
        : [];
    const travelEstimate = focusedStop ? calculateTravelEstimate(previousStop, focusedStop) : null;

    const handleStartNavigation = (stop) => {
        if (!stop) return;
        const destination = encodeURIComponent(`${stop.address}, ${stop.city}`);
        const originParam = previousStop
            ? `&origin=${encodeURIComponent(`${previousStop.address}, ${previousStop.city}`)}`
            : '';
        window.open(
            `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination}&travelmode=driving`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <div className="flex flex-col bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl min-h-[680px]">
            {/* Header: INDRIVE + Context + Profiel */}
            <header className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wider">
                        INDRIVE
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-200">
                        {selectedRoute ? selectedRoute.name : 'Chauffeursportaal'}
                    </span>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-300">
                        {driverName}
                    </span>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    <button
                        type="button"
                        aria-label="Profielfoto wijzigen"
                        title="Profielfoto wijzigen"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <img
                            src={avatarSrc}
                            alt={driverName}
                            onError={() => setAvatarSrc(defaultAvatar)}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow"
                        />
                    </button>
                </div>
            </header>

            {/* SCHERM 1: TOEGEWEZEN ROUTES OVERZICHT */}
            {!selectedRoute ? (
                <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-base font-bold text-white mb-0.5">Toegewezen Routes</h2>
                    <p className="text-xs text-slate-400 mb-4">Selecteer een route om stops te inspecteren</p>

                    <div className="flex flex-col gap-3">
                        {routes.map((r) => {
                            const isInProgress = r.status === 'IN_PROGRESS';
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleSelectRoute(r)}
                                    className="w-full text-left bg-slate-950/90 border border-slate-800 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                isInProgress
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}
                                        >
                                            {r.status || 'PLANNED'}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono">ID: #{r.id}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-1.5">{r.name}</h3>
                                    <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                        Bekijk stops &amp; kaart →
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : focusedStop ? (
                /* SCHERM 3: ACTIEVE STOP / BEZORGSCHERM (Na klik op Volgende / Continue trip) */
                <div className="flex flex-col flex-1">
                    <div className="p-4 flex flex-col gap-3 flex-1">
                        {/* Terug naar stoppenlijst */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setFocusedStopId(null)}
                                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                ← Terug naar stoppenlijst
                            </button>
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Onderweg naar stop #{focusedStop.sequenceOrder}
                            </span>
                        </div>

                        {/* Ordergegevens & Geschatte reistijd kaart */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-blue-400">
                                    Stop #{focusedStop.sequenceOrder} van {sortedStops.length}
                                </span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30">
                                    {focusedStop.status}
                                </span>
                            </div>

                            <h2 className="text-base font-bold text-white">{focusedStop.recipientName}</h2>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Order: {focusedStop.orderNumber}
                            </p>
                            <p className="text-xs text-slate-200 mt-1.5">
                                {focusedStop.address}, {focusedStop.city}
                            </p>

                            {/* Reistijd & Start Navigatie */}
                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                        Geschatte reistijd
                                    </span>
                                    <span className="text-sm font-bold text-emerald-400">
                                        ~{travelEstimate.minutes} min
                                        {travelEstimate.distanceKm && (
                                            <span className="text-xs font-normal text-slate-400 ml-1">
                                                ({travelEstimate.distanceKm} km)
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleStartNavigation(focusedStop)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3.5 rounded-lg text-xs transition-colors cursor-pointer shadow"
                                >
                                    Start Navigatie ↗
                                </button>
                            </div>
                        </div>

                        {/* Kaart in de vrije ruimte in het midden: Vorige stop -> Huidige stop */}
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                                <span>
                                    {previousStop
                                        ? `Route: Stop #${previousStop.sequenceOrder} → Stop #${focusedStop.sequenceOrder}`
                                        : `Bestemming: Stop #${focusedStop.sequenceOrder}`}
                                </span>
                                <span className="text-blue-400 font-medium">{focusedStop.city}</span>
                            </div>
                            <div className="h-[250px] w-full">
                                <RouteMap stops={legMapStops} minHeight="250px" />
                            </div>
                        </div>
                    </div>

                    {/* Actieknoppen onderaan: Delivered & Not Delivered */}
                    <footer className="p-4 bg-slate-950 border-t border-slate-800 mt-auto">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={updatingId === focusedStop.id}
                                onClick={() => handleStatusUpdate(focusedStop.id, 'DELIVERED')}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
                            >
                                Delivered
                            </button>
                            <button
                                type="button"
                                disabled={updatingId === focusedStop.id}
                                onClick={() => handleStatusUpdate(focusedStop.id, 'FAILED_NOT_HOME')}
                                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                            >
                                Not Delivered
                            </button>
                        </div>
                    </footer>
                </div>
            ) : (
                /* SCHERM 2: ROUTE DETAILS (STOPPENLIJST / OVERZICHTSKAART) */
                <div className="flex flex-col flex-1">
                    <div className="p-4 pb-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRoute(null);
                                setIsStreamingActive(false);
                            }}
                            className="text-xs text-slate-400 hover:text-white mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            ← Kies een andere route
                        </button>

                        {/* Tab Switcher: Stoppenlijst vs Kaart & Route */}
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('LIST')}
                                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'LIST'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Stoppenlijst ({stops.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('MAP')}
                                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'MAP'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Kaart &amp; Route
                            </button>
                        </div>

                        {/* Statusbadge: Rit is actief */}
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isStreamingActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${isStreamingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                {isStreamingActive ? 'Rit is actief' : 'Rit gepauzeerd'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsStreamingActive(!isStreamingActive)}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                            >
                                {isStreamingActive ? 'GPS Pauzeren' : 'Start Rit / GPS'}
                            </button>
                        </div>
                    </div>

                    {/* Hoofdsectie: Stoppenlijst OF Kaart */}
                    <div className="flex-1 px-4 overflow-hidden">
                        {activeTab === 'LIST' ? (
                            <div className="overflow-y-auto max-h-[440px] pr-1 pb-3">
                                <StopList
                                    stops={sortedStops}
                                    onStatusUpdate={handleStatusUpdate}
                                    updatingId={updatingId}
                                />
                            </div>
                        ) : (
                            <div className="h-[440px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                                <RouteMap
                                    stops={sortedStops}
                                    minHeight="440px"
                                    onSelectStop={(stop) => {
                                        if (stop.status === 'PENDING') {
                                            setFocusedStopId(stop.id);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Vaste actiebalk onderaan: opent het actieve bezorgscherm */}
                    <footer className="p-4 bg-slate-950 border-t border-slate-800 mt-auto">
                        <button
                            type="button"
                            disabled={!nextPendingStop}
                            onClick={() => {
                                if (nextPendingStop) {
                                    setIsStreamingActive(true);
                                    setFocusedStopId(nextPendingStop.id);
                                }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/30"
                        >
                            {nextPendingStop
                                ? `Volgende stop: #${nextPendingStop.sequenceOrder}`
                                : 'Alle stops voltooid'}
                        </button>
                    </footer>
                </div>
            )}
        </div>
    );
}