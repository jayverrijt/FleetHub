import { useState } from 'react';
import RouteView from './pages/RouteView';
import CustomerTrackingView from './pages/CustomerTrackingView';
import LoginView from './pages/LoginView';
import FleetLiveMap from './components/FleetLiveMap';
import { useFleetTelemetry } from './hooks/useFleetTelemetry';
import { getCurrentUser, logout } from './services/authService';

export default function App() {
    const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
    const [isCustomerPortal, setIsCustomerPortal] = useState(false);

    // US3b: Realtime telemetrie via WebSocket subscription (/topic/fleet/locations)
    const { vehicles, isConnected: isFleetConnected } = useFleetTelemetry();

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
    };

    const formatDisplayName = (user) => {
        if (!user?.fullName) return '';
        const roleLabel = user.role === 'ROLE_COURIER' ? 'Chauffeur' : 'Planner';
        return `${user.fullName} (${roleLabel})`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Responsive Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-8 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
            FleetHub
          </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCustomerPortal(!isCustomerPortal)}
                        className="text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                        {isCustomerPortal ? 'Inloggen' : 'Track & Trace'}
                    </button>

                    {currentUser && !isCustomerPortal && (
                        <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-xs sm:text-sm text-slate-300">
                {formatDisplayName(currentUser)}
              </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                                Uitloggen
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Containers */}
            <main className="flex-1 p-3 sm:p-6 flex justify-center items-start">
                {isCustomerPortal ? (
                    <div className="w-full max-w-3xl">
                        <CustomerTrackingView />
                    </div>
                ) : !currentUser ? (
                    <div className="w-full max-w-5xl flex justify-center py-4">
                        <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />
                    </div>
                ) : currentUser.role === 'ROLE_COURIER' ? (
                    /* Mobile-first InDrive Container */
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <RouteView currentUser={currentUser} />
                    </div>
                ) : (
                    /* Dispatcher Dashboard Container */
                    <div className="w-full max-w-7xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    Fleet Dashboard — Dispatcher Overzicht
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">Realtime vlootmonitoring en routecoördinatie</p>
                            </div>

                            {/* Dynamische WebSocket statusbadge */}
                            <span className={`text-xs px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 ${
                                isFleetConnected
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            }`}>
                <span className={`w-2 h-2 rounded-full ${isFleetConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                                {isFleetConnected ? 'Live Verbinding Actief' : 'Verbinding Offline'}
              </span>
                        </div>

                        {/* Vloot Statistieken */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Actieve Voertuigen</div>
                                <div className="text-3xl font-extrabold text-sky-400 mt-2">
                                    {vehicles.length}
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Voltooide Stops</div>
                                <div className="text-3xl font-extrabold text-emerald-400 mt-2">42</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Openstaande Incidenten</div>
                                <div className="text-3xl font-extrabold text-rose-400 mt-2">0</div>
                            </div>
                        </div>

                        {/* Interactieve Leaflet Vlootkaart */}
                        <div className="h-[560px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1 shadow-inner">
                            <FleetLiveMap vehicles={vehicles} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}