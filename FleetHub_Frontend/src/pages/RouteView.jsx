import { useState, useRef } from 'react';
import DEFAULT_AVATAR from '../assets/default-avatar.svg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export default function RouteView({ currentUser }) {
    const [avatarUrl, setAvatarUrl] = useState(
        () => currentUser?.avatarUrl || localStorage.getItem('fleethub_avatar') || DEFAULT_AVATAR
    );
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const driverId = currentUser?.userId || currentUser?.id || 1;
    const driverName = currentUser?.fullName || 'Jan de Vries';

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('driverId', driverId);

        setIsUploading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/driver/profile-picture`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Uploaden is mislukt');
            }

            const data = await response.json();
            setAvatarUrl(data.avatarUrl);
            localStorage.setItem('fleethub_avatar', data.avatarUrl);

            const stored = JSON.parse(localStorage.getItem('fleethub_user') || '{}');
            stored.avatarUrl = data.avatarUrl;
            localStorage.setItem('fleethub_user', JSON.stringify(stored));
        } catch (err) {
            alert(`Fout bij uploaden profielfoto: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[620px] bg-slate-900 text-slate-100 font-sans">
            {/* Topbar met uploadbare Driver Avatar */}
            <header className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded">
            INDRIVE
          </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-200">
            Chauffeursportaal
          </span>
                </div>

                {/* Chauffeur Profiel Avatar + Upload Trigger */}
                <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-blue-400">
            {driverName}
          </span>

                    <div
                        className="relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500 bg-slate-800 flex items-center justify-center relative">
                            <img
                                src={avatarUrl}
                                alt={driverName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR;
                                }}
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                                    <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-white shadow">
                            📷
                        </div>
                    </div>
                </div>
            </header>

            {/* Rest van RouteView */}
        </div>
    );
}