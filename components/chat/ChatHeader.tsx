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
  onGroupProfileClick?: () => void;
}

export function ChatHeader({
  selectedUser,
  callAccepted,
  calling,
  isWatchTogether,
  onCall,
  onWatchTogether,
  onGroupProfileClick,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between gap-3 bg-[#0d0d0d]">
      <div className={`flex items-center gap-3 min-w-0 ${selectedUser.isGroup ? 'cursor-pointer' : ''}`}
  onClick={selectedUser.isGroup ? onGroupProfileClick : undefined}>
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
