import { useState, useEffect } from 'react';
import { login } from '../services/authService';

export default function LoginView({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const authData = await login(email, password);
            onLoginSuccess(authData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (quickEmail, quickPassword) => {
        setEmail(quickEmail);
        setPassword(quickPassword);
        setError(null);
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

            {/* LINKER PANEEL: Alleen zichtbaar op Desktop / Tablet */}
            <div className="hidden md:flex flex-col justify-between p-8 sm:p-10 bg-slate-950 border-r border-slate-800">
                <div>
          <span className="inline-block bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-md mb-4 tracking-wide">
            FLEETHUB DISPATCH
          </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                        Centraal Vloot- &amp; Bezorgplatform
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Realtime synchronisatie tussen wagenparkbeheerders, centrale dispatching en mobiele bezorgers op de weg.
                    </p>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
                        <div className="text-xs text-slate-400">Systeem Status</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Operationeel
                        </div>
                    </div>
                </div>

                {/* Demo Testknoppen op Desktop */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs font-semibold text-slate-400 mb-2">SNELTOETSEN VOOR DEMO:</div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('driver1@fleethub.nl', 'password123')}
                            className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-xs font-semibold transition-colors"
                        >
                            Chauffeur InDrive
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('dispatcher@fleethub.nl', 'password123')}
                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-semibold transition-colors"
                        >
                            Dispatcher Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* RECHTER PANEEL: Inlogformulier */}
            <div className="p-6 sm:p-10 flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Inloggen</h2>
                <p className="text-slate-400 text-sm mb-6">Voer uw inloggegevens in om direct toegang te krijgen.</p>

                {/* Snelle testknoppen op mobiel */}
                <div className="flex md:hidden gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => handleQuickLogin('driver1@fleethub.nl', 'password123')}
                        className="flex-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-xs font-semibold"
                    >
                        Chauffeur
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickLogin('dispatcher@fleethub.nl', 'password123')}
                        className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-semibold"
                    >
                        Dispatcher
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mailadres</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="bijv. driver1@fleethub.nl"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Wachtwoord</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs px-3.5 py-2.5 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticeren...' : 'Inloggen bij FleetHub'}
                    </button>
                </form>
            </div>

        </div>
    );
}