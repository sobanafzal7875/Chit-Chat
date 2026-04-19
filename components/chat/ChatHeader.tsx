'use client';

import type { ChatUser } from '@/types/chat';
import { CallOutlineIcon, WatchTogetherOutlineIcon } from '@/components/chat/CallWatchIcons';

export interface ChatHeaderProps {
  selectedUser: ChatUser;
  callAccepted: boolean;
  calling: boolean;
  isWatchTogether: boolean;
  onCall: () => void;
  onWatchTogether: () => void;
  onBack?: () => void;
  onGroupInfoClick?: () => void;
}

export function ChatHeader({
  selectedUser,
  callAccepted,
  calling,
  isWatchTogether,
  onCall,
  onWatchTogether,
  onBack,
  onGroupInfoClick,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between gap-3 bg-[#0d0d0d]">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground shrink-0"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={selectedUser.isGroup ? onGroupInfoClick : undefined}
          className={`flex items-center gap-3 min-w-0 ${selectedUser.isGroup ? 'cursor-pointer hover:opacity-80' : ''}`}
        >
        <div className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0">
          {selectedUser.dp ? (
            <img src={selectedUser.dp} className="w-full h-full object-cover" alt="" />
          ) : (
            selectedUser.name?.charAt(0).toUpperCase() ||
            selectedUser.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-foreground">
            {selectedUser.name || selectedUser.username}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {selectedUser.isGroup
              ? `${selectedUser.members?.length || 0} members`
              : `@${selectedUser.username}`}
          </p>
        </div>
        </button>
      </div>
      {!selectedUser.isGroup && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Voice call"
            onClick={onCall}
            disabled={callAccepted || calling}
            className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <CallOutlineIcon />
          </button>
          <button
            type="button"
            title="Watch together"
            onClick={onWatchTogether}
            disabled={isWatchTogether}
            className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <WatchTogetherOutlineIcon />
          </button>
        </div>
      )}
    </div>
  );
}
