function TabIcon({ id }) {
  if (id === 'dashboard') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
  if (id === 'transactions') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
  if (id === 'forecast') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

const MOBILE_LABELS = {
  dashboard: 'Dashboard',
  transactions: 'Pénzek',
  forecast: 'Tervezés',
  clients: 'Ügyfelek',
};

export default function Navbar({ activeTab, setActiveTab, user, onSignOut }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Tranzakciók' },
    { id: 'forecast', label: 'Tervezés' },
    { id: 'clients', label: 'Ügyfelek' },
  ];

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────── */}
      <nav className="navbar-bg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/scrollers-logo.png"
              alt="Scrollers"
              className="h-6 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span
              className="text-xs font-semibold ml-1 px-2 py-0.5 rounded-full hidden xs:inline"
              style={{ background: 'rgba(123,92,246,0.25)', color: '#9B79FF' }}
            >
              Pénzügyek
            </span>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                style={
                  activeTab === tab.id
                    ? { background: 'linear-gradient(135deg, #7B5CF6, #5A3FD6)' }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User / kijelentkezés */}
          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <span className="text-xs text-gray-400 hidden md:block truncate max-w-36">{user.email}</span>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Kilépés
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ──────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden flex border-t border-gray-800"
        style={{ background: '#111111' }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{ color: active ? '#9B79FF' : '#6B7280' }}
            >
              <TabIcon id={tab.id} />
              <span className="text-[10px] font-medium leading-tight">{MOBILE_LABELS[tab.id]}</span>
              {active && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-t-full"
                  style={{ background: '#9B79FF' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
