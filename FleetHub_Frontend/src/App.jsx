import { useState } from 'react';
import RouteView from './pages/RouteView';
import CustomerTrackingView from './pages/CustomerTrackingView';
import LoginView from './pages/LoginView';
import { getCurrentUser, logout } from './services/authService';

export default function App() {
    // Lazy initialization: leest localStorage direct uit bij de eerste mount zonder cascading render
    const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
    const [isCustomerPortal, setIsCustomerPortal] = useState(false);

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
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
                        onClick={() => setIsCustomerPortal(!isCustomerPortal)}
                        className="text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        {isCustomerPortal ? 'Inloggen' : 'Track & Trace'}
                    </button>

                    {currentUser && !isCustomerPortal && (
                        <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-xs sm:text-sm text-slate-300">
                {currentUser.fullName} ({currentUser.role === 'ROLE_COURIER' ? 'Chauffeur' : 'Planner'})
              </span>
                            <button
                                onClick={handleLogout}
                                className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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
                            <span className="text-xs bg-sky-500/10 border border-sky-500/30 text-sky-400 px-3 py-1 rounded-full font-medium">
                Live Verbinding Actief
              </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Actieve Voertuigen</div>
                                <div className="text-3xl font-extrabold text-sky-400 mt-2">4</div>
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

                        <div className="h-96 bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col justify-center items-center text-slate-500">
                            <div className="text-lg font-bold text-slate-300">Live Vlootkaart (Leaflet / WebSockets)</div>
                            <div className="text-sm text-slate-500 mt-1">Klaar voor US3: Live GPS Tracking & Dispatch Map</div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}