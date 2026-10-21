import { useState, useEffect } from 'react';
import { fetchDriverRoutes, fetchStopsForRoute, updateStopStatus } from '../services/stopService';
import RouteMap from '../components/RouteMap';

export default function RouteView({ currentUser }) {
    const [currentScreen, setCurrentScreen] = useState('ROUTES');
    const [viewMode, setViewMode] = useState('LIST');
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState([]);
    const [activeStop, setActiveStop] = useState(null);
    const [isTripStarted, setIsTripStarted] = useState(false);
    // Begint direct op true zodat er geen synchrone setState in het effect nodig is
    const [loading, setLoading] = useState(true);

    const driverId = currentUser?.userId || 1;
    const driverName = currentUser?.fullName || 'Jan de Vries';

    useEffect(() => {
        let isMounted = true;

        fetchDriverRoutes(driverId)
            .then((data) => {
                if (isMounted) {
                    setRoutes(data || []);
                }
            })
            .catch((err) => {
                console.error('Fout bij het ophalen van routes:', err);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [driverId]);

    const handleSelectRoute = async (route) => {
        setSelectedRoute(route);
        setIsTripStarted(false);
        setLoading(true);
        try {
            const data = await fetchStopsForRoute(route.id);
            const sorted = (data || []).sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
            setStops(sorted);
            setCurrentScreen('STOPS');
        } catch (err) {
            alert(`Fout bij het laden van stops: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrip = () => {
        setIsTripStarted(true);
        const nextPending = stops.find((s) => s.status === 'PENDING') || stops[0];
        if (nextPending) {
            setActiveStop(nextPending);
            setCurrentScreen('DELIVERY');
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!isTripStarted) {
            alert('Start eerst de rit voordat je stops kunt afronden.');
            return;
        }
        if (!activeStop) return;

        try {
            await updateStopStatus(activeStop.id, newStatus);
            const updated = stops.map((s) => (s.id === activeStop.id ? { ...s, status: newStatus } : s));
            setStops(updated);

            const nextPending = updated.find((s) => s.status === 'PENDING' && s.id !== activeStop.id);
            if (nextPending) {
                setActiveStop(nextPending);
            } else {
                alert('Alle stops van deze route zijn voltooid.');
                setCurrentScreen('STOPS');
            }
        } catch (err) {
            alert(`Bijwerken mislukt: ${err.message}`);
        }
    };

    const handleCardClick = (stop) => {
        if (!isTripStarted) {
            alert('Start eerst de rit via de knop onderaan om stops te openen.');
            return;
        }
        setActiveStop(stop);
        setCurrentScreen('DELIVERY');
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case 'FAILED_NOT_HOME':
                return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            case 'PENDING':
            default:
                return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[620px] bg-slate-900 text-slate-100">
            {/* Topbar */}
            <header className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded">
            INDRIVE
          </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-200">
            {selectedRoute ? selectedRoute.name : 'Chauffeursportaal'}
          </span>
                </div>
                <span className="text-xs font-semibold text-blue-400">
          {driverName}
        </span>
            </header>

            {/* 1. ROUTESELECTIE */}
            {currentScreen === 'ROUTES' && (
                <main className="flex-1 p-4 flex flex-col">
                    <h2 className="text-base font-bold text-white mb-1">Toegewezen Routes</h2>
                    <p className="text-xs text-slate-400 mb-4">Selecteer een route om stops te inspecteren</p>

                    {loading ? (
                        <div className="text-center py-10 text-xs text-slate-400">Routes laden...</div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                            Geen toegewezen routes gevonden.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {routes.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => handleSelectRoute(r)}
                                    className="bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                                >
                                    <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                      {r.status || 'GEPLAND'}
                    </span>
                                        <span className="text-xs text-slate-400">ID: #{r.id}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-1">{r.name}</h3>
                                    <p className="text-xs text-blue-400 font-medium">Bekijk stops &amp; kaart →</p>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            )}

            {/* 2. OVERZICHT (LIJST EN KAART) */}
            {currentScreen === 'STOPS' && (
                <>
                    <main className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                        <button
                            onClick={() => setCurrentScreen('ROUTES')}
                            className="self-start text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            ← Kies een andere route
                        </button>

                        {/* Toggle Knop */}
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setViewMode('LIST')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                    viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Stoppenlijst ({stops.length})
                            </button>
                            <button
                                onClick={() => setViewMode('MAP')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                    viewMode === 'MAP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Kaart &amp; Route
                            </button>
                        </div>

                        {/* Ritstatus Banner */}
                        <div className={`p-2.5 rounded-lg text-xs text-center border font-medium ${
                            isTripStarted
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}>
                            {isTripStarted ? '● Rit is actief' : 'Rit is nog niet gestart. Start hieronder om stops te openen.'}
                        </div>

                        {loading ? (
                            <div className="text-center py-10 text-xs text-slate-400">Route laden...</div>
                        ) : viewMode === 'LIST' ? (
                            <div className="flex flex-col gap-2.5">
                                {stops.map((stop, index) => {
                                    const isSelected = activeStop?.id === stop.id;
                                    return (
                                        <div
                                            key={stop.id}
                                            onClick={() => handleCardClick(stop)}
                                            className={`p-3 rounded-xl border transition-all ${
                                                !isTripStarted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-slate-600'
                                            } ${
                                                isSelected
                                                    ? 'bg-blue-600/10 border-blue-500'
                                                    : 'bg-slate-950 border-slate-800'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-blue-400">
                          Stop #{stop.sequenceOrder ?? index + 1}
                        </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(stop.status)}`}>
                          {stop.status}
                        </span>
                                            </div>
                                            <div className="text-sm font-semibold text-white">{stop.recipientName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{stop.address}, {stop.city}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-80 rounded-xl overflow-hidden border border-slate-800">
                                <RouteMap
                                    stops={stops}
                                    onSelectStop={(stop) => {
                                        if (isTripStarted) {
                                            setActiveStop(stop);
                                            setCurrentScreen('DELIVERY');
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </main>

                    {/* Vaste Footerknop */}
                    <footer className="p-3 bg-slate-950 border-t border-slate-800">
                        {!isTripStarted ? (
                            <button
                                onClick={handleStartTrip}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                            >
                                Start Rit
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    const next = stops.find((s) => s.status === 'PENDING') || stops[0];
                                    setActiveStop(next);
                                    setCurrentScreen('DELIVERY');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                            >
                                Volgende stop: #{activeStop?.sequenceOrder ?? 1}
                            </button>
                        )}
                    </footer>
                </>
            )}

            {/* 3. INDIVIDUEEL STOP SCHERM */}
            {currentScreen === 'DELIVERY' && activeStop && (
                <main className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <button
                            onClick={() => setCurrentScreen('STOPS')}
                            className="text-xs text-slate-400 hover:text-white mb-3 inline-block transition-colors"
                        >
                            ← Terug naar overzicht
                        </button>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-4">
                            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  Stop #{activeStop.sequenceOrder}
                </span>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(activeStop.status)}`}>
                  {activeStop.status}
                </span>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-0.5">{activeStop.recipientName}</h2>
                            <p className="text-xs text-slate-400 mb-4">Order: {activeStop.orderNumber}</p>

                            <div className="border-t border-slate-800 pt-3 space-y-1">
                                <p className="text-xs text-slate-300">
                                    <span className="text-slate-500 font-medium">Adres:</span> {activeStop.address}
                                </p>
                                <p className="text-xs text-slate-300">
                                    <span className="text-slate-500 font-medium">Stad:</span> {activeStop.city}
                                </p>
                            </div>
                        </div>
                    </div>

                    {activeStop.status === 'PENDING' ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange('DELIVERED')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                            >
                                Geleverd
                            </button>
                            <button
                                onClick={() => handleStatusChange('FAILED_NOT_HOME')}
                                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                            >
                                Niet Thuis
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                            Deze stop is al gemarkeerd als <strong className="text-white">{activeStop.status}</strong>.
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}