export default function Navbar({ activeTab, setActiveTab, user, onSignOut }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Tranzakciók' },
    { id: 'forecast', label: 'Tervezés' },
  ];

  return (
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
            className="text-xs font-semibold ml-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(123,92,246,0.25)', color: '#9B79FF' }}
          >
            Pénzügyek
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
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
        {user && onSignOut && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
            <button
              onClick={onSignOut}
              className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Kilépés
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
