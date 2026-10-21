import React, { useState } from 'react';
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

    const getStatusConfig = (status) => {
        switch (status) {
            case 'DELIVERED':
                return { label: 'Bezorgd', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.2)' };
            case 'FAILED_NOT_HOME':
                return { label: 'Niet thuis aangetroffen', color: '#f87171', bg: 'rgba(239, 68, 68, 0.2)' };
            case 'PENDING':
            default:
                return { label: 'Chauffeur onderweg', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.2)' };
        }
    };

    return (
        <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px', color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ background: '#000', borderRadius: '6px', padding: '6px 10px', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #374151' }}>
                    LOGO
                </div>
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>FleetHub: Track & Trace</h2>
            </div>

            {/* Zoekbalk */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Voer ordernummer in (bijv. ORD-1001)"
                    style={{
                        flex: 1,
                        padding: '12px 14px',
                        backgroundColor: '#1e242d',
                        border: '1px solid #374151',
                        borderRadius: '10px',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '0.9rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0 20px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '...' : 'Zoek'}
                </button>
            </form>

            {/* 404 / Foutmelding */}
            {error && (
                <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '0.9rem',
                    marginBottom: '16px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Resultaat Card */}
            {trackingData && (
                <div style={{
                    backgroundColor: '#1e242d',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid #2d3748',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Zending</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{trackingData.orderNumber}</span>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
            <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: getStatusConfig(trackingData.status).color,
                backgroundColor: getStatusConfig(trackingData.status).bg
            }}>
              ● {getStatusConfig(trackingData.status).label}
            </span>
                    </div>

                    <div style={{ borderTop: '1px solid #374151', paddingTop: '14px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Bezorgadres
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f3f4f6' }}>{trackingData.recipientName}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '2px' }}>
                            {trackingData.address}, {trackingData.city}
                        </div>
                    </div>

                    {trackingData.completedAt && (
                        <div style={{
                            marginTop: '16px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            fontSize: '0.85rem',
                            color: '#86efac'
                        }}>
                            ✓ Bezorgd om: {new Date(trackingData.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}