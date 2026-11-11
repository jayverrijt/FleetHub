import React from 'react';

export default function StopCard({ stop, onStatusUpdate, isUpdating = false }) {
    if (!stop) return null;

    const isDelivered = stop.status === 'DELIVERED';
    const isFailed = stop.status === 'FAILED_NOT_HOME' || stop.status === 'FAILED';
    const isPending = stop.status === 'PENDING';
    const isCompleted = isDelivered || isFailed;

    const getBadgeStyle = () => {
        if (isDelivered) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        if (isFailed) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    };

    return (
        <div
            className={`bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm transition-all hover:border-slate-700 ${
                isCompleted ? 'completed' : ''
            }`}
        >
            {/* Header: Stop volgnummer + Status Badge */}
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-blue-400">
                    Stop #{stop.sequenceOrder}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
                    {stop.status}
                </span>
            </div>

            {/* Klant en Order info */}
            <div className="text-sm font-semibold text-white">{stop.recipientName}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
                <span>Order: </span>
                <span>{stop.orderNumber}</span>
            </div>

            {/* Adres */}
            <div className="text-xs text-slate-300 mt-1">
                {stop.address}, {stop.city}
            </div>

            {/* Actieknoppen voor bezorging */}
            {isPending && onStatusUpdate && (
                <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                        type="button"
                        onClick={() => onStatusUpdate(stop.id, 'DELIVERED')}
                        disabled={isUpdating}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                        Geleverd
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusUpdate(stop.id, 'FAILED_NOT_HOME')}
                        disabled={isUpdating}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                        Niet Thuis
                    </button>
                </div>
            )}

            {/* Completion label */}
            {isCompleted && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Afgehandeld</span>
                </div>
            )}
        </div>
    );
}