'use client';

import type { ChatUser } from '@/types/chat';

export interface ChatHeaderProps {
  selectedUser: ChatUser;
  callAccepted: boolean;
  calling: boolean;
  isWatchTogether: boolean;
  onCall: () => void;
  onWatchTogether: () => void;
  onBack?: () => void;
  onGroupProfileClick?: () => void;
}

export function ChatHeader({
  selectedUser,
  callAccepted,
  calling,
  isWatchTogether,
  onCall,
  onWatchTogether,
  onBack,
  onGroupProfileClick,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 px-3 sm:px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between gap-3 bg-[#0d0d0d] reative z-10">
       {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      {/* Left: back + avatar + info */}
      <div
        className={`flex items-center gap-3 min-w-0 ${selectedUser.isGroup ? 'cursor-pointer' : ''}`}
        onClick={selectedUser.isGroup ? onGroupProfileClick : undefined}
      >
        {/* Mobile back button */}
        {onBack && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] shrink-0 transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#2a1f15] border border-[#2a2a2a] flex items-center justify-center font-semibold text-sm overflow-hidden text-[#f5e6dc]">
            {selectedUser.dp ? (
              <img src={selectedUser.dp} className="w-full h-full object-cover" alt="" />
            ) : (
              (selectedUser.name || selectedUser.username)?.charAt(0).toUpperCase()
            )}
          </div>
          {/* Online dot — wire to real online status if available */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0d0d0d]" />
        </div>

        {/* Name / meta */}
        <div className="min-w-0">
          <h3 className="font-semibold text-[13px] truncate text-foreground leading-tight">
            {selectedUser.name || selectedUser.username}
          </h3>
          <p className="text-[11px] text-green-400/80 truncate leading-tight">
            {selectedUser.isGroup
              ? `${selectedUser.members?.length || 0} members`
              : 'Online'}
          </p>
        </div>
      </div>

      {/* Right: action icons */}
      {!selectedUser.isGroup && (
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Search icon (cosmetic for now) */}
          <button
            type="button"
            title="Search"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </button>

          {/* Voice call */}
          <button
            type="button"
            title="Voice call"
            onClick={onCall}
            disabled={callAccepted || calling}
            className="p-2 rounded-xl text-muted-foreground hover:text-[#FF781F] hover:bg-[#FF781F]/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </button>

          {/* Video call icon */}
          <button
            type="button"
            title="Video call"
            onClick={onWatchTogether}
            disabled={isWatchTogether}
            className="p-2 rounded-xl text-muted-foreground hover:text-[#FF781F] hover:bg-[#FF781F]/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </button>

          {/* More / kebab */}
          <button
            type="button"
            title="More options"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>
      )}

      {/* Group header action */}
      {selectedUser.isGroup && (
        <button
          type="button"
          title="Group info"
          onClick={onGroupProfileClick}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors shrink-0"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      )}
    </div>
  );
}