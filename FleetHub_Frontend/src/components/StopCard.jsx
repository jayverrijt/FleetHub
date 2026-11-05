import 'react';

export default function StopCard({ stop, onStatusUpdate, isUpdating }) {
    const isCompleted = stop.status === 'DELIVERED' || stop.status === 'FAILED_NOT_HOME';

    return (
        <div className={`stop-card ${isCompleted ? 'completed' : ''}`}>
            <div className="stop-header">
                <span className="stop-badge">Stop #{stop.sequenceOrder}</span>
                <span className={`status-pill status-${stop.status.toLowerCase()}`}>
          {stop.status}
        </span>
            </div>

            <div className="stop-body">
                <h3 className="recipient-name">{stop.recipientName}</h3>
                <p className="order-number">Order: <strong>{stop.orderNumber}</strong></p>
                <p className="address">{stop.address}, {stop.city}</p>
            </div>

            {/* US5b: Knoppen zijn uitgeschakeld zodra de levering voltooid is */}
            {!isCompleted ? (
                <div className="stop-actions">
                    <button
                        className="btn btn-delivered"
                        disabled={isUpdating}
                        onClick={() => onStatusUpdate(stop.id, 'DELIVERED')}
                    >
                        Geleverd
                    </button>
                    <button
                        className="btn btn-failed"
                        disabled={isUpdating}
                        onClick={() => onStatusUpdate(stop.id, 'FAILED_NOT_HOME')}
                    >
                        Niet Thuis
                    </button>
                </div>
            ) : (
                <p className="completion-label">Afgehandeld</p>
            )}
        </div>
    );
}