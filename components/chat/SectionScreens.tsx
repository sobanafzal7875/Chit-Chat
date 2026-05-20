'use client';

// ─── Calls Section ───────────────────────────────────────────────────────────
export function CallsScreen() {
  const mockCalls = [
    { id: '1', name: 'Riya Sharma', time: 'Today, 10:30 AM', type: 'outgoing', missed: false },
    { id: '2', name: 'Devansh Kulkarni', time: 'Today, 9:12 AM', type: 'incoming', missed: true },
    { id: '3', name: 'Ananya Iyer', time: 'Yesterday, 8:45 PM', type: 'incoming', missed: false },
    { id: '4', name: 'Rohit Menon', time: 'Yesterday, 3:20 PM', type: 'outgoing', missed: false },
    { id: '5', name: 'Ajay Mehta', time: 'Mon, 11:00 AM', type: 'incoming', missed: true },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col  border-white/[0.06] bg-white/[0.04] backdrop-blur-xs overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#1e1e1e] shrink-0">
        <h2 className="text-[15px] font-semibold text-foreground">Voice Calls</h2>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">Recent call history</p>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {mockCalls.length === 0 ? (
          <EmptyState
            icon={
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            }
            text="No recent calls"
          />
        ) : (
          <ul className="px-2 py-2 space-y-0.5">
            {mockCalls.map((call) => (
              <li key={call.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#2a1f15] border border-[#2a2a2a] flex items-center justify-center text-sm font-semibold text-[#f5e6dc] shrink-0">
                  {call.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{call.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Arrow icon */}
                    {call.type === 'outgoing' ? (
                      <svg className="w-3 h-3 text-[#FF781F] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    ) : (
                      <svg className={`w-3 h-3 shrink-0 ${call.missed ? 'text-red-400' : 'text-green-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17h10M7 17V7"/>
                      </svg>
                    )}
                    <span className={`text-[11px] ${call.missed ? 'text-red-400/80' : 'text-muted-foreground/60'}`}>
                      {call.missed ? 'Missed · ' : ''}{call.time}
                    </span>
                  </div>
                </div>

                {/* Call back button */}
                <button
                  type="button"
                  title="Call back"
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-[#FF781F] hover:bg-[#FF781F]/10"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// ─── Watch Together Section ───────────────────────────────────────────────────
export function WatchScreen() {
  return (
    <div className="flex-1 min-h-0 flex flex-col  border-white/[0.06] bg-white/[0.04] backdrop-blur-xs overflow-hidden">
      {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      <div className="px-4 py-4 border-b border-[#1e1e1e] shrink-0">
        <h2 className="text-[15px] font-semibold text-foreground">Watch Together</h2>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">Share your screen with friends</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF781F]/10 border border-[#FF781F]/20 flex items-center justify-center">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[#FF781F]">
            <rect x="2" y="4" width="14" height="10" rx="1.5"/>
            <rect x="8" y="10" width="14" height="10" rx="1.5"/>
            <path fill="currentColor" stroke="none" d="M13.5 13.5L17 15.5l-3.5 2v-4z"/>
          </svg>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-foreground mb-1">Watch with friends</h3>
          <p className="text-[12px] text-muted-foreground/60 leading-relaxed max-w-[220px]">
            Start a session and share your screen. Invite friends to watch together in real time.
          </p>
        </div>

        <div className="w-full space-y-2">
          {[
            { label: 'Screen sharing', icon: '🖥️', desc: 'Share any tab or window' },
            { label: 'Voice sync', icon: '🎙️', desc: 'Talk while you watch' },
            { label: 'Invite anyone', icon: '👥', desc: 'Add from your contacts' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-[#242424] text-left">
              <span className="text-lg shrink-0">{f.icon}</span>
              <div>
                <p className="text-[12px] font-medium text-foreground">{f.label}</p>
                <p className="text-[11px] text-muted-foreground/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/40">
          Open a chat and press the 📹 icon to start
        </p>
      </div>
    </div>
  );
}


// ─── Groups Section ───────────────────────────────────────────────────────────
interface GroupsScreenProps {
  chats: any[];
  selectedUser: any;
  onUserSelect: (u: any) => void;
  onStartGroupCreation: () => void;
}

export function GroupsScreen({ chats, selectedUser, onUserSelect, onStartGroupCreation }: GroupsScreenProps) {
  const groups = chats.filter((c) => c.isGroup);

  return (
    <div className="flex-1 min-h-0 flex flex-col border-white/[0.06] bg-white/[0.04] backdrop-blur-xs h-full overflow-hidden">
      {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      <div className="px-4 py-4 border-b border-[#1e1e1e] shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Groups</h2>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={onStartGroupCreation}
          className="px-3 py-1.5 rounded-lg bg-[#FF781F] text-black text-[12px] font-semibold hover:bg-[#ff9538] transition-colors shadow-[0_0_12px_rgba(255,120,31,0.3)]"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {groups.length === 0 ? (
          <EmptyState
            icon={
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            }
            text="No groups yet"
            sub="Create a group to get started"
          />
        ) : (
          <ul className="px-2 py-2 space-y-0.5">
            {groups.map((g) => {
              const isSelected = selectedUser?.id === g.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => onUserSelect(g)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isSelected ? 'bg-[#FF781F]/10' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2a1f15] border border-[#2a2a2a] flex items-center justify-center text-sm font-semibold text-[#f5e6dc] overflow-hidden shrink-0">
                      {g.dp ? <img src={g.dp} className="w-full h-full object-cover" alt="" /> : (g.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${isSelected ? 'text-[#FF781F]' : 'text-foreground'}`}>
                        {g.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 truncate">
                        {g.members?.length || 0} members · {g.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {g.unreadCount > 0 && (
                      <span className="bg-[#FF781F] text-black text-[9px] min-w-[16px] h-4 px-1 rounded-full font-bold flex items-center justify-center shrink-0">
                        {g.unreadCount > 9 ? '9+' : g.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}


// ─── Encrypted Section ────────────────────────────────────────────────────────
export function EncryptedScreen() {
  return (
    <div className="flex-1 min-h-0 flex flex-col  border-white/[0.06] bg-white/[0.04] backdrop-blur-xs overflow-hidden">
      {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      <div className="px-4 py-4 border-b border-[#1e1e1e] shrink-0">
        <h2 className="text-[15px] font-semibold text-foreground">Encrypted</h2>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">End-to-end encrypted chats</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-green-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-foreground mb-1">End-to-End Encrypted</h3>
          <p className="text-[12px] text-muted-foreground/60 leading-relaxed max-w-[220px]">
            Your messages are secured with end-to-end encryption. Only you and the recipient can read them.
          </p>
        </div>

        <div className="w-full space-y-2">
          {[
            { icon: '🔐', label: 'Messages encrypted', desc: 'All messages use AES-256' },
            { icon: '🚫', label: 'No server storage', desc: 'Messages never stored in plain text' },
            { icon: '🔑', label: 'Key exchange', desc: 'Diffie-Hellman key protocol' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-[#242424] text-left">
              <span className="text-lg shrink-0">{f.icon}</span>
              <div>
                <p className="text-[12px] font-medium text-foreground">{f.label}</p>
                <p className="text-[11px] text-muted-foreground/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-xl border border-green-500/20 w-full">
          <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <p className="text-[11px] text-green-400/80">Your connection is secure</p>
        </div>
      </div>
    </div>
  );
}


// ─── Shared empty state component ─────────────────────────────────────────────
function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-muted-foreground/40">
      <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center opacity-50">
        {icon}
      </div>
      <p className="text-[12px] font-medium">{text}</p>
      {sub && <p className="text-[11px] opacity-70">{sub}</p>}
    </div>
  );
}