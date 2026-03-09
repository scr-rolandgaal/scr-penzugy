import { isDemoMode } from '../lib/supabase';

export default function DemoBanner({ onReset }) {
  if (!isDemoMode) return null;

  return (
    <div
      className="w-full px-4 py-2 flex items-center justify-between text-sm font-semibold"
      style={{ background: '#FDE047', color: '#713F12' }}
    >
      <span>DEMO MÓD — Az adatok nem kerülnek mentésre. Csak bemutatási célra.</span>
      <button
        onClick={onReset}
        className="ml-4 px-3 py-1 rounded-lg text-xs font-bold"
        style={{ background: '#92400E', color: '#FEF3C7' }}
      >
        Demo visszaállítása
      </button>
    </div>
  );
}
