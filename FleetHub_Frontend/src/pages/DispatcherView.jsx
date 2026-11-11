import React from 'react';
import { useFleetTelemetry } from '../hooks/useFleetTelemetry';
import FleetLiveMap from '../components/FleetLiveMap';

export default function DispatcherView() {
    const { vehicles, isConnected } = useFleetTelemetry();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6">
            {/* Header & Status Indicator */}
            <header className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">FleetHub: Dispatcher Live Map</h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time GPS telemetrie overzicht van actieve bezorgwagens</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Broker:</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                        <span className={`w-2 h-2 mr-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {isConnected ? 'Verbonden (Live)' : 'Verbinding verbroken'}
                    </span>
                </div>
            </header>

            {/* KPI Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Actieve Voertuigen</span>
                    <div className="text-3xl font-extrabold text-white mt-1">{vehicles.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Rijdend (&gt; 5 km/u)</span>
                    <div className="text-3xl font-extrabold text-blue-400 mt-1">
                        {vehicles.filter((v) => (v.speed || 0) * 3.6 > 5).length}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Stilstaand</span>
                    <div className="text-3xl font-extrabold text-amber-400 mt-1">
                        {vehicles.filter((v) => (v.speed || 0) * 3.6 <= 5).length}
                    </div>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                {/* Voertuigen Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[650px] overflow-hidden">
                    <h2 className="text-sm font-semibold uppercase text-slate-300 pb-3 border-b border-slate-800">
                        Vloot Telemetrie ({vehicles.length})
                    </h2>
                    <div className="overflow-y-auto flex-1 mt-3 space-y-2.5 pr-1">
                        {vehicles.length === 0 ? (
                            <div className="text-xs text-slate-500 text-center py-10">
                                Geen actieve voertuigen gedetecteerd. Wachten op GPS-signalen...
                            </div>
                        ) : (
                            vehicles.map((v) => (
                                <div
                                    key={v.vehicleId}
                                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg p-3 transition"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm text-white">Voertuig #{v.vehicleId}</span>
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                                            {Math.round((v.speed || 0) * 3.6)} km/u
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-300">{v.driverName}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                                        {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Leaflet Live Map */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-2 h-[650px]">
                    <FleetLiveMap vehicles={vehicles} />
                </div>
            </div>
        </div>
    );
}