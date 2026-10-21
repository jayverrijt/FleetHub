import React, { useState } from 'react';
import RouteView from './pages/RouteView';
import CustomerTrackingView from './pages/CustomerTrackingView';

export default function App() {
    const [activeTab, setActiveTab] = useState('driver'); // 'driver' | 'tracking'

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '16px 8px' }}>
            {/* Navigatieswitcher bovenaan */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <button
                    onClick={() => setActiveTab('driver')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: activeTab === 'driver' ? '#2563eb' : '#1e293b',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    🚐 InDrive Chauffeur
                </button>
                <button
                    onClick={() => setActiveTab('tracking')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: activeTab === 'tracking' ? '#2563eb' : '#1e293b',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    📦 Klant Track & Trace
                </button>
            </div>

            {/* Actieve component renderen */}
            {activeTab === 'driver' ? <RouteView /> : <CustomerTrackingView />}
        </div>
    );
}