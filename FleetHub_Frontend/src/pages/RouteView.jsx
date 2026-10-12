// src/pages/RouteView.jsx
import { useState, useEffect } from 'react';
import { fetchDriverRoutes, fetchStopsForRoute, updateStopStatus } from '../services/stopService';
import RouteMap from '../components/RouteMap';

// Hulpfunctie om route statussen visueel weer te geven met Font Awesome
const renderRouteStatusBadge = (status) => {
    if (status === 'IN_PROGRESS') {
        return (
            <span
                className="route-badge"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(37, 99, 235, 0.25)',
                    color: '#60a5fa',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600
                }}
            >
                <i className="fas fa-car-alt"></i>
                Klaar voor vertrek
            </span>
        );
    }

    if (status === 'COMPLETED') {
        return (
            <span
                className="route-badge"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600
                }}
            >
                <i className="fas fa-check"></i>
                Voltooid
            </span>
        );
    }

    return (
        <span className="route-badge">
            {status || 'Gepland'}
        </span>
    );
};

export default function RouteView() {
    const [currentScreen, setCurrentScreen] = useState('ROUTES'); // 'ROUTES', 'STOPS', 'DELIVERY'
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' of 'MAP'
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stops, setStops] = useState([]);
    const [activeStop, setActiveStop] = useState(null);
    const [isTripStarted, setIsTripStarted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        fetchDriverRoutes(1)
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
    }, []);

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
                alert('Gefeliciteerd! Alle stops van deze route zijn voltooid.');
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

    return (
        <div className="device-frame">
            <header className="top-bar">
                <div className="brand-group">
                    <span className="logo-badge">LOGO</span>
                    <span className="brand-title">FleetHub: InDrive</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#9aa5b4' }}>
                    {selectedRoute ? `Driver #${selectedRoute.driverId}` : 'John Doe'}
                </span>
            </header>

            {/* 1. ROUTESELECTIE */}
            {currentScreen === 'ROUTES' && (
                <main className="screen-container">
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Toegewezen Routes</h2>
                    <p style={{ color: '#9aa5b4', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Selecteer een route om stops te inspecteren
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#9aa5b4' }}>Routes laden...</div>
                    ) : routes.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#9aa5b4' }}>Geen toegewezen routes gevonden.</div>
                    ) : (
                        routes.map((r) => (
                            <div key={r.id} className="route-card" onClick={() => handleSelectRoute(r)}>
                                <div className="route-card-header">
                                    {renderRouteStatusBadge(r.status)}
                                    <span style={{ fontSize: '0.8rem', color: '#9aa5b4' }}>ID: #{r.id}</span>
                                </div>
                                <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{r.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Bekijk stops & kaart →</p>
                            </div>
                        ))
                    )}
                </main>
            )}

            {/* 2. OVERZICHT (LIJST EN KAART) */}
            {currentScreen === 'STOPS' && (
                <>
                    <main className="screen-container">
                        <button className="btn-back" onClick={() => setCurrentScreen('ROUTES')}>
                            ← Andere route kiezen
                        </button>

                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'LIST' ? 'active' : ''}`}
                                onClick={() => setViewMode('LIST')}
                            >
                                Stoppenlijst ({stops.length})
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'MAP' ? 'active' : ''}`}
                                onClick={() => setViewMode('MAP')}
                            >
                                Kaart & Route
                            </button>
                        </div>

                        {!isTripStarted ? (
                            <div className="trip-banner">
                                Rit is nog niet gestart. Start de rit hieronder om stops te openen.
                            </div>
                        ) : (
                            <div className="trip-banner" style={{ borderColor: 'rgba(34, 197, 94, 0.4)', color: '#86efac' }}>
                                Rit is actief
                            </div>
                        )}

                        {loading ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#9aa5b4' }}>Route laden...</div>
                        ) : viewMode === 'LIST' ? (
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {stops.map((stop, index) => (
                                    <div
                                        key={stop.id}
                                        className={`stop-card-item ${!isTripStarted ? 'locked' : ''} ${activeStop?.id === stop.id ? 'active' : ''}`}
                                        onClick={() => handleCardClick(stop)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600 }}>Stop #{stop.sequenceOrder ?? index + 1}</span>
                                            <span className={`badge badge-${String(stop.status).toLowerCase()}`}>{stop.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{stop.recipientName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#9aa5b4' }}>{stop.address}, {stop.city}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <RouteMap
                                stops={stops}
                                onSelectStop={(stop) => {
                                    if (isTripStarted) {
                                        setActiveStop(stop);
                                        setCurrentScreen('DELIVERY');
                                    }
                                }}
                            />
                        )}
                    </main>

                    <footer className="trip-footer-bar">
                        {!isTripStarted ? (
                            <button className="btn-start-trip" onClick={handleStartTrip}>
                                Start Rit
                            </button>
                        ) : (
                            <button
                                className="btn-start-trip"
                                onClick={() => {
                                    const next = stops.find((s) => s.status === 'PENDING') || stops[0];
                                    setActiveStop(next);
                                    setCurrentScreen('DELIVERY');
                                }}
                            >
                                Volgende stop: #{activeStop?.sequenceOrder ?? 1}
                            </button>
                        )}
                    </footer>
                </>
            )}

            {/* 3. INDIVIDUEEL STOP SCHERM */}
            {currentScreen === 'DELIVERY' && activeStop && (
                <main className="screen-container">
                    <button className="btn-back" onClick={() => setCurrentScreen('STOPS')}>
                        ← Terug naar overzicht
                    </button>

                    <div className="delivery-detail-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span className="route-badge">Stop #{activeStop.sequenceOrder}</span>
                            <span className={`badge badge-${String(activeStop.status).toLowerCase()}`}>{activeStop.status}</span>
                        </div>

                        <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '6px' }}>{activeStop.recipientName}</h2>
                        <p style={{ fontSize: '0.85rem', color: '#9aa5b4', marginBottom: '16px' }}>Order: {activeStop.orderNumber}</p>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#d1d5db', marginBottom: '6px' }}>
                                <span style={{ color: '#9aa5b4' }}>Adres:</span> <strong>{activeStop.address}</strong>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
                                <span style={{ color: '#9aa5b4' }}>Stad:</span> <strong>{activeStop.city}</strong>
                            </p>
                        </div>
                    </div>

                    {activeStop.status === 'PENDING' ? (
                        <div className="delivery-actions">
                            <button className="btn-delivered" onClick={() => handleStatusChange('DELIVERED')}>
                                Geleverd
                            </button>
                            <button className="btn-failed" onClick={() => handleStatusChange('FAILED_NOT_HOME')}>
                                Niet Thuis
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px', color: '#9aa5b4', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                            Deze stop is al gemarkeerd als <strong>{activeStop.status}</strong>.
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}