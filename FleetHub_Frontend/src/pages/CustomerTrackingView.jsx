import { useState } from 'react';
import { fetchTrackingInfo } from '../services/trackingService';

export default function CustomerTrackingView() {
    const [orderNumber, setOrderNumber] = useState('ORD-1001');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await fetchTrackingInfo(orderNumber);
            setTrackingData(data);
        } catch (err) {
            setError(err.message);
            setTrackingData(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return {
                    label: 'Bezorgd',
                    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                };
            case 'FAILED_NOT_HOME':
                return {
                    label: 'Niet thuis aangetroffen',
                    className: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                };
            case 'PENDING':
            default:
                return {
                    label: 'Chauffeur onderweg',
                    className: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                };
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4 sm:p-6 text-slate-100">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
        <span className="bg-slate-900 border border-slate-700 text-white text-xs font-black px-2.5 py-1.5 rounded-lg tracking-wider">
          FLEETHUB
        </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Track &amp; Trace
                </h2>
            </div>

            {/* Zoekbalk */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Voer ordernummer in (bijv. ORD-1001)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                    {loading ? '...' : 'Zoeken'}
                </button>
            </form>

            {/* Foutmelding */}
            {error && (
                <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Resultaat Card */}
            {trackingData && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Zending</span>
                        <span className="text-base font-bold text-white tracking-wide">{trackingData.orderNumber}</span>
                    </div>

                    <div>
            <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadge(trackingData.status).className}`}>
              <span className="h-2 w-2 rounded-full bg-current"></span>
                {getStatusBadge(trackingData.status).label}
            </span>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">
                            Bezorgadres
                        </div>
                        <div className="text-base font-semibold text-white">{trackingData.recipientName}</div>
                        <div className="text-sm text-slate-400 mt-0.5">
                            {trackingData.address}, {trackingData.city}
                        </div>
                    </div>

                    {trackingData.completedAt && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                            ✓ Afgerond om: {new Date(trackingData.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}