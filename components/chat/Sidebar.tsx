'use client';

interface SidebarProps {
  currentUser: { username: string; name?: string; dp?: string };
  activeSection?: 'chats' | 'calls' | 'watch' | 'groups' | 'encrypted';
  onSectionChange?: (section: 'chats' | 'calls' | 'watch' | 'groups' | 'encrypted') => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const navItems = [
  {
    key: 'chats',
    label: 'Chats',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    key: 'calls',
    label: 'Voice Calls',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
    ),
  },
  {
    key: 'watch',
    label: 'Watch Together',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <rect x="2" y="4" width="14" height="10" rx="1.5"/>
        <rect x="8" y="10" width="14" height="10" rx="1.5"/>
        <path fill="currentColor" stroke="none" d="M13.5 13.5L17 15.5l-3.5 2v-4z"/>
      </svg>
    ),
  },
  {
    key: 'groups',
    label: 'Groups',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    key: 'encrypted',
    label: 'Encrypted',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
] as const;

export function Sidebar({
  currentUser,
  activeSection = 'chats',
  onSectionChange,
  onProfileClick,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[72px] h-full shrink-0 border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl relative z-20">
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />

        {/* Logo */}
        <div className="flex items-center justify-center h-16 shrink-0 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src="/NexoraLogo.png"
              alt="Nexora"
              className="w-full h-full object-contain mix-blend-lighten"
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-4 px-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                title={item.label}
                onClick={() => onSectionChange?.(item.key)}
                className={`relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-[#FF781F]/15 text-[#FF781F] shadow-[0_0_20px_rgba(255,120,31,0.15)]'
                    : 'text-white/30 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#FF781F] rounded-r-full" />
                )}
                {item.icon}

                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: profile + logout */}
        <div className="flex flex-col items-center gap-2 pb-4 px-2 shrink-0 border-t border-white/[0.06]  pt-3">
          <button
            type="button"
            title="Logout"
            onClick={onLogout}
            className="w-full flex items-center justify-center p-3 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
              Logout
            </span>
          </button>

          <button
            type="button"
            title={currentUser.name || currentUser.username}
            onClick={onProfileClick}
            className="w-12 h-12 rounded-full  overflow-hidden border border-white/10 hover:border-[#FF781F]/50 transition-all duration-200 shrink-0 bg-[#1f1f1f] flex items-center justify-center text-sm font-semibold group relative"
          >
            {currentUser.dp ? (
              <img src={currentUser.dp} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-white/60">
                {(currentUser.name || currentUser.username).charAt(0).toUpperCase()}
              </span>
            )}
            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
              {currentUser.name || currentUser.username}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 border-t border-white/[0.06] bg-black/80 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSectionChange?.(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
                ${isActive ? 'text-[#FF781F]' : 'text-white/30 hover:text-white/60'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium tracking-wide">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onProfileClick}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 transition-all"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex items-center justify-center text-[10px] font-bold bg-[#1f1f1f]">
            {currentUser.dp ? (
              <img src={currentUser.dp} className="w-full h-full object-cover" alt="" />
            ) : (
              (currentUser.name || currentUser.username).charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-[10px] font-medium tracking-wide">Profile</span>
        </button>
      </nav>
    </>
  );
}