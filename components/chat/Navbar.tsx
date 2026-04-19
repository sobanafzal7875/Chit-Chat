'use client';

import { Button } from '@/components/ui/button';
import { ChitChatMark } from '@/components/chat/ChitChatMark';

interface NavbarProps {
  currentUser: { username: string; name?: string; dp?: string };
  onProfileClick: () => void;
  onLogout: () => void;
}

export function Navbar({ currentUser, onProfileClick, onLogout }: NavbarProps) {
  return (
    <header className="shrink-0 border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 sm:px-6 py-3 flex justify-between items-center z-20">
      <div className="flex items-center gap-3 min-w-0">
        <ChitChatMark className="text-neutral-500 shrink-0 w-9 h-9" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
          Chit<span className="text-[#FF781F]">Chat</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-sm font-semibold overflow-hidden hover:border-[#3a3a3a] transition-colors"
        >
          {currentUser?.dp ? (
            <img src={currentUser.dp} className="w-full h-full object-cover" alt="" />
          ) : (
            <span className="text-muted-foreground">
              {currentUser?.name?.charAt(0).toUpperCase() ||
                currentUser?.username?.charAt(0).toUpperCase()}
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
