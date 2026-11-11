import React, { useState, useEffect, useRef } from 'react';
import { useDriverLocationBroadcaster } from '../hooks/useDriverLocationBroadcaster';
import { updateStopStatus, fetchDriverRoutes, fetchStopsForRoute } from '../services/stopService';
import { API_BASE_URL } from '../services/apiClient';
import RouteMap from '../components/RouteMap';
import StopList from '../components/StopList';
import defaultAvatar from '../assets/default-avatar.svg';

export default function RouteView({
                                      currentUser,
                                      initialRoutes = null,
                                      initialStops = null
                                  }) {
    const driverId = currentUser?.id ?? currentUser?.userId ?? 1;
    const driverName = currentUser?.fullName || 'Jan de Vries';

    const [routes, setRoutes] = useState(initialRoutes || []);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState(initialStops || []);
    const [activeTab, setActiveTab] = useState('LIST');
    const [isStreamingActive, setIsStreamingActive] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [loadingRoutes, setLoadingRoutes] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
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
        if (initialRoutes || !currentUser?.role) return;

        let isMounted = true;
        setLoadingRoutes(true);
        setErrorMessage(null);

        fetchDriverRoutes(driverId)
            .then((data) => {
                if (isMounted) {
                    setRoutes(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Fout bij ophalen routes:', err);
                    setErrorMessage('Kon routes niet laden');
                }
            })
            .finally(() => {
                if (isMounted) setLoadingRoutes(false);
            });

        return () => {
            isMounted = false;
        };
    }, [driverId, currentUser?.role, initialRoutes]);

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
                let errorMsg = 'Uploaden is mislukt';
                if (response && typeof response.json === 'function') {
                    const errorData = await response.json().catch(() => ({}));
                    if (errorData?.message) errorMsg = errorData.message;
                }
                throw new Error(errorMsg);
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
        setIsStreamingActive(route.status === 'IN_PROGRESS');

        try {
            const data = await fetchStopsForRoute(route.id);
            if (Array.isArray(data) && data.length > 0) {
                setStops([...data].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0)));
            }
        } catch (err) {
            console.error('Fout bij ophalen stops voor route:', err);
        }
    };

    const handleStatusUpdate = async (stopId, newStatus) => {
        try {
            setUpdatingId(stopId);
            await updateStopStatus(stopId, newStatus);
            setStops((prev) => prev.map((s) => (s.id === stopId ? { ...s, status: newStatus } : s)));
        } catch {
            setStops((prev) => prev.map((s) => (s.id === stopId ? { ...s, status: newStatus } : s)));
        } finally {
            setUpdatingId(null);
        }
    };

    const nextPendingStop = stops.find((s) => s.status === 'PENDING');

    return (
        <div className="flex flex-col bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl min-h-[640px]">
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
                        onChange={(e) => {
                            void handleFileChange(e);
                        }}
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

            {/* SCHERM 2: TOEGEWEZEN ROUTES OVERZICHT */}
            {!selectedRoute ? (
                <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-base font-bold text-white mb-0.5">Toegewezen Routes</h2>
                    <p className="text-xs text-slate-400 mb-4">Selecteer een route om stops te inspecteren</p>

                    {loadingRoutes ? (
                        <div className="text-center py-12 text-xs text-slate-400">Routes laden...</div>
                    ) : errorMessage ? (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                            {errorMessage}
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                            Geen actieve routes gevonden voor deze chauffeur.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {routes.map((r) => {
                                const isInProgress = r.status === 'IN_PROGRESS';
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            void handleSelectRoute(r);
                                        }}
                                        className="w-full text-left bg-slate-950/90 border border-slate-800 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-all shadow-sm block focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    )}
                </div>
            ) : (
                /* SCHERM 3 & 4: ROUTE DETAILS (STOPPENLIJST / KAART) */
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

                    <div className="flex-1 px-4 overflow-hidden">
                        {activeTab === 'LIST' ? (
                            <div className="overflow-y-auto max-h-[440px] pr-1 pb-3">
                                <StopList
                                    stops={stops}
                                    onStatusUpdate={handleStatusUpdate}
                                    updatingId={updatingId}
                                />
                            </div>
                        ) : (
                            <div className="h-[440px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                                <RouteMap stops={stops} />
                            </div>
                        )}
                    </div>

                    <footer className="p-4 bg-slate-950 border-t border-slate-800 mt-auto">
                        <button
                            type="button"
                            onClick={() => {
                                if (nextPendingStop) {
                                    void handleStatusUpdate(nextPendingStop.id, 'DELIVERED');
                                }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/30"
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