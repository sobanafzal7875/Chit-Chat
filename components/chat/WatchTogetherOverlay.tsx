'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface WatchTogetherOverlayProps {
  isWatchTogether: boolean;
  isWatchTogetherAdmin: boolean;
  watchTogetherParticipants: any[];
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  mutedParticipants: Set<string>;
  currentUser: any;
  searchQuery: string;
  searchResults: any[];
  onEndWatchTogether: () => void;
  onStartScreenShare: () => void;
  onToggleSelfMute: () => void;
  onAddParticipant: (username: string) => void;
  onRemoveParticipant: (username: string) => void;
  onToggleParticipantMute: (username: string) => void;
  onSearchQueryChange: (query: string) => void;
}

export function WatchTogetherOverlay({
  isWatchTogether,
  isWatchTogetherAdmin,
  watchTogetherParticipants,
  isScreenSharing,
  screenStream,
  mutedParticipants,
  currentUser,
  searchQuery,
  searchResults,
  onEndWatchTogether,
  onStartScreenShare,
  onToggleSelfMute,
  onAddParticipant,
  onRemoveParticipant,
  onToggleParticipantMute,
  onSearchQueryChange,
}: WatchTogetherOverlayProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = screenVideoRef.current;
    if (!el) return;
    if (screenStream) {
      el.srcObject = screenStream;
    } else {
      el.srcObject = null;
    }
    return () => {
      el.srcObject = null;
    };
  }, [screenStream]);

  if (!isWatchTogether) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card/90 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-semibold text-white">Watch Together Session</span>
          {isWatchTogetherAdmin && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isWatchTogetherAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchQueryChange('')}
              className="bg-card/50 border-border/50 text-white hover:bg-card/70"
            >
              Add People
            </Button>
          )}
          <Button
            onClick={onStartScreenShare}
            variant="outline"
            size="sm"
            className="bg-card/50 border-border/50 text-white hover:bg-card/70"
          >
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
          <Button
            onClick={onToggleSelfMute}
            variant={mutedParticipants.has(currentUser.username) ? "destructive" : "outline"}
            size="sm"
            className="bg-card/50 border-border/50 text-white hover:bg-card/70"
          >
            {mutedParticipants.has(currentUser.username) ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            onClick={onEndWatchTogether}
            variant="destructive"
            size="sm"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Screen Share Area */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {isScreenSharing && screenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              className="max-w-full max-h-full object-contain"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="text-white text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <p className="text-lg">Waiting for screen share...</p>
            </div>
          )}

          {/* Participants Overlay */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 max-w-xs">
            <h4 className="text-white font-semibold mb-2">Participants ({watchTogetherParticipants.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {watchTogetherParticipants.map((participant: any) => (
                <div key={participant.username} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {participant.dp ? <img src={participant.dp} className="w-full h-full object-cover"/> : participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm truncate">
                      {participant.name} {participant.isAdmin && '(Admin)'}
                    </span>
                  </div>
                  {isWatchTogetherAdmin && participant.username !== currentUser.username && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onToggleParticipantMute(participant.username)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          mutedParticipants.has(participant.username)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                        }`}
                        title={mutedParticipants.has(participant.username) ? 'Unmute' : 'Mute'}
                      >
                        {mutedParticipants.has(participant.username) ? '🔇' : '🔊'}
                      </button>
                      <button
                        onClick={() => onRemoveParticipant(participant.username)}
                        className="w-6 h-6 rounded bg-red-600 text-white hover:bg-red-700 flex items-center justify-center text-xs"
                        title="Remove from session"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {!isWatchTogetherAdmin && participant.username === currentUser.username && (
                    <button
                      onClick={() => onRemoveParticipant(currentUser.username)}
                      className="w-6 h-6 rounded bg-red-600 text-white hover:bg-red-700 flex items-center justify-center text-xs"
                      title="Leave session"
                    >
                      🚪
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add People Sidebar (Admin Only) */}
        {isWatchTogetherAdmin && searchQuery && (
          <div className="w-80 bg-card border-l border-border/50 flex flex-col">
            <div className="p-3 border-b border-border/50">
              <h3 className="font-semibold">Add Participants</h3>
              <p className="text-sm text-muted-foreground">Search for users to add to the session</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {searchResults
                .filter(u => u.username !== currentUser.username && !watchTogetherParticipants.some(p => p.username === u.username))
                .map(u => (
                  <div key={u._id} className="p-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {u.dp ? <img src={u.dp} className="w-full h-full object-cover"/> : u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{u.name}</div>
                      <div className="text-xs opacity-70 truncate">@{u.username}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAddParticipant(u.username)}
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}