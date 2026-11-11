import React from 'react';
import StopCard from './StopCard';

export default function StopList({ stops = [], onStatusUpdate, updatingId }) {
    if (!stops || stops.length === 0) {
        return (
            <div className="text-center py-6 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                Er zijn momenteel geen actieve stops toegewezen aan deze rit.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {stops.map((stop) => (
                <StopCard
                    key={stop.id}
                    stop={stop}
                    onStatusUpdate={onStatusUpdate}
                    isUpdating={updatingId === stop.id}
                />
            ))}
        </div>
    );
}