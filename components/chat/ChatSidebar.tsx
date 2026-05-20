'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChatListItem, ChatUser } from '@/types/chat';

type FilterTab = 'all' | 'unread' | 'groups' | 'calls';

interface ChatSidebarProps {
  chats: ChatListItem[];
  searchQuery: string;
  searchResults: ChatUser[];
  isSearching: boolean;
  selectedUser: { id?: string; username?: string; isGroup?: boolean } | null;
  currentUser: { username: string };
  isGroupCreationMode: boolean;
  groupCreationStep: 'select' | 'name';
  groupName: string;
  selectedMembers: string[];
  onSearchQueryChange: (query: string) => void;
  onSearchUsers: (query: string) => void;
  onUserSelect: (user: ChatListItem | ChatUser) => void;
  onGroupCreate: () => void;
  onStartGroupCreation: () => void;
  onCancelGroupCreation: () => void;
  onProceedToNameStep: () => void;
  onGroupNameChange: (name: string) => void;
  onMemberToggle: (username: string) => void;
  onDeleteChat?: (chat: ChatListItem) => void;
}

export function ChatSidebar({
  chats,
  searchQuery,
  searchResults,
  isSearching: _isSearching,
  selectedUser,
  currentUser: _currentUser,
  isGroupCreationMode,
  groupCreationStep,
  groupName,
  selectedMembers,
  onSearchQueryChange,
  onSearchUsers,
  onUserSelect,
  onGroupCreate,
  onStartGroupCreation,
  onCancelGroupCreation,
  onProceedToNameStep,
  onGroupNameChange,
  onMemberToggle,
  onDeleteChat,
}: ChatSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'groups', label: 'Groups' },
    { key: 'calls', label: 'Calls' },
  ];

  const filteredChats = chats.filter((c) => {
    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'groups') return c.isGroup;
    if (activeFilter === 'calls') return false; // calls logic can be wired later
    return true;
  });

  const unreadTotal = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div
      className={`md:col-span-1 bg-[#111111] rounded-2xl border border-[#242424] overflow-hidden flex flex-col h-full min-h-0 ${
        selectedUser && !isGroupCreationMode ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        {/* Title row */}
        {!isGroupCreationMode && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-foreground tracking-tight">Chats</h2>
            <button
              type="button"
              onClick={onStartGroupCreation}
              title="New chat or group"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              {/* Compose / edit icon */}
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Group creation header */}
        {isGroupCreationMode && groupCreationStep === 'name' && (
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={onCancelGroupCreation}
              className="flex items-center justify-center p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-[15px] font-semibold text-foreground">New Group</h2>
          </div>
        )}

        {isGroupCreationMode && groupCreationStep === 'select' && (
          <h2 className="text-[15px] font-semibold text-foreground mb-3">Add Members</h2>
        )}

        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <Input
            placeholder={isGroupCreationMode ? 'Search users to add…' : 'Search messages or users…'}
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              if (isGroupCreationMode) onSearchUsers(e.target.value);
            }}
            className="pl-8 h-9 text-[13px] bg-[#1a1a1a] border-[#2a2a2a] placeholder:text-muted-foreground/50 focus-visible:ring-[#FF781F]/30 focus-visible:border-[#FF781F]/40"
          />
        </div>

        {/* Filter tabs — only in normal mode */}
        {!isGroupCreationMode && !searchQuery && (
          <div className="flex items-center gap-1 mt-3">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              const showBadge = tab.key === 'unread' && unreadTotal > 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FF781F] text-black shadow-[0_0_12px_rgba(255,120,31,0.3)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                  }`}
                >
                  {tab.label}
                  {showBadge && (
                    <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold leading-none ${
                      isActive ? 'bg-black/20 text-black' : 'bg-[#FF781F] text-black'
                    }`}>
                      {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* List area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain relative z-0">
        {isGroupCreationMode ? (
          groupCreationStep === 'name' ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Group name</label>
                <Input
                  placeholder="Enter group name…"
                  value={groupName}
                  onChange={(e) => onGroupNameChange(e.target.value)}
                  className="w-full bg-[#1a1a1a] border-[#2a2a2a] focus-visible:ring-[#FF781F]/30"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          ) : (
            <ul className="px-2 py-1 space-y-0.5">
              {(searchQuery ? searchResults : chats.filter(c => !c.isGroup).map(c => ({
                id: c.id, username: c.username || '', name: c.name || c.username || '', dp: c.dp,
              }))).map((u) => (
                <li
                  key={u.id || u.username}
                  onClick={() => onMemberToggle(u.username)}
                  className="p-2 hover:bg-white/[0.04] rounded-xl cursor-pointer flex gap-3 items-center"
                >
                  <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    selectedMembers.includes(u.username)
                      ? 'bg-[#FF781F] border-[#FF781F]'
                      : 'border-[#3a3a3a]'
                  }`}>
                    {selectedMembers.includes(u.username) && (
                      <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2a1f15] flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0 border border-[#2a2a2a] text-[#f5e6dc]">
                    {u.dp ? <img src={u.dp} className="w-full h-full object-cover" alt="" /> : (u.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] truncate">{u.name || u.username}</div>
                    <div className="text-[11px] text-muted-foreground truncate">@{u.username}</div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <>
            {searchQuery ? (
              <ul className="px-2 py-1 space-y-0.5">
                {searchResults.map((u) => (
                  <li key={u.id || u.username}>
                    <button
                      type="button"
                      onClick={() => { onUserSelect(u); onSearchQueryChange(''); }}
                      className="w-full p-2 hover:bg-white/[0.04] rounded-xl flex gap-3 items-center text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#2a1f15] flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0 border border-[#2a2a2a] text-[#f5e6dc]">
                        {u.dp ? <img src={u.dp} className="w-full h-full object-cover" alt="" /> : (u.name || u.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[13px] truncate">{u.name || u.username}</div>
                        <div className="text-[11px] text-muted-foreground">@{u.username}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="px-2 py-1 space-y-0.5">
                {filteredChats.length === 0 && (
                  <li className="flex flex-col items-center justify-center py-10 text-muted-foreground/50">
                    <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <p className="text-[12px]">No chats here</p>
                  </li>
                )}
                {filteredChats.map((c) => {
                  const isSelected = selectedUser?.id === c.id || (!c.isGroup && selectedUser?.username === c.username);
                  return (
                    <li
                      key={c.id}
                      className={`group flex relative gap-0.5 items-stretch rounded-xl transition-colors ${
                        isSelected ? 'bg-[#FF781F]/10' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onUserSelect(c)}
                        className="flex flex-1 min-w-0 gap-3 items-center p-2.5 text-left rounded-xl"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#2a1f15] flex items-center justify-center text-sm font-semibold overflow-hidden border border-[#2a2a2a] text-[#f5e6dc]">
                            {c.dp ? (
                              <img src={c.dp} className="w-full h-full object-cover" alt="" />
                            ) : (
                              (c.name || c.username || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* Online dot — can be wired to real online state */}
                          {/* <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#111111]" /> */}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[13px] font-medium truncate ${isSelected ? 'text-[#FF781F]' : 'text-foreground'}`}>
                              {c.name || c.username}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0">
                              {c.lastMessage?.createdAt
                                ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] text-muted-foreground/70 truncate leading-snug">
                              {c.lastMessage?.unsent
                                ? 'Message removed'
                                : c.lastMessage?.content || (c.lastMessage?.fileUrl ? '📷 Photo' : 'No messages yet')}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="bg-[#FF781F] text-black text-[9px] min-w-[16px] h-4 px-1 rounded-full font-bold shrink-0 flex items-center justify-center">
                                {c.unreadCount > 9 ? '9+' : c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Delete button */}
                      {onDeleteChat && (
                        <button
                          type="button"
                          title="Delete chat"
                          onClick={(e) => { e.stopPropagation(); onDeleteChat(c); }}
                          className="shrink-0 px-2 my-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {isGroupCreationMode ? (
        <div className="border-t border-[#1e1e1e] p-3 shrink-0 flex gap-2 relative z-10 bg-[#111111]">
          <Button
            variant="outline"
            onClick={onCancelGroupCreation}
            className="flex-1 h-10 border-[#2a2a2a] bg-transparent text-[13px]"
          >
            Cancel
          </Button>
          {groupCreationStep === 'select' ? (
            <Button
              onClick={onProceedToNameStep}
              disabled={selectedMembers.length === 0}
              className="flex-1 h-10 bg-[#FF781F] text-black hover:bg-[#ff9538] font-semibold text-[13px] disabled:opacity-40"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={onGroupCreate}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className="flex-1 h-10 bg-[#FF781F] text-black hover:bg-[#ff9538] font-semibold text-[13px] disabled:opacity-40"
            >
              Create Group
            </Button>
          )}
        </div>
      ) : (
        <div className="border-t border-[#1e1e1e] p-3 shrink-0 relative z-10 bg-[#111111]">
          <Button
            type="button"
            onClick={onStartGroupCreation}
            className="w-full h-10 rounded-xl bg-[#FF781F] text-black font-semibold hover:bg-[#ff9538] text-[13px] shadow-[0_0_20px_rgba(255,120,31,0.2)] transition-all"
          >
            + New Group
          </Button>
        </div>
      )}
    </div>
  );
}