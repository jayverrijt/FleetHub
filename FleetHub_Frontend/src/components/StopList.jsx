import StopCard from './StopCard';

export default function StopList({ stops = [], onStatusUpdate, updatingId }) {
    if (!stops || stops.length === 0) {
        return (
            <div className="empty-state">
                <p>Er zijn momenteel geen actieve stops toegewezen aan deze rit.</p>
            </div>
        );
    }

    return (
        <div className="stop-list">
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