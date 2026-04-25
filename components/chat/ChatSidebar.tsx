'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChatListItem, ChatUser } from '@/types/chat';

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
  return (
    <div
      className={`md:col-span-1 bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden flex flex-col h-full min-h-0 ${
        selectedUser && !isGroupCreationMode ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="p-3 border-b border-[#2a2a2a] shrink-0 flex items-center gap-2">
        {isGroupCreationMode && groupCreationStep === 'name' && (
          <button
            type="button"
            onClick={onCancelGroupCreation}
            className="flex items-center justify-center p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <Input
            placeholder={isGroupCreationMode ? 'Search users to add…' : 'Search users…'}
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              if (isGroupCreationMode) {
                onSearchUsers(e.target.value);
              }
            }}
            className="w-full bg-[#0d0d0d] border-[#2a2a2a] placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {isGroupCreationMode ? (
          groupCreationStep === 'name' ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Group name</label>
                <Input
                  placeholder="Enter group name…"
                  value={groupName}
                  onChange={(e) => onGroupNameChange(e.target.value)}
                  className="w-full bg-[#0d0d0d] border-[#2a2a2a]"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Selected {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <ul className="p-1 space-y-0.5">
              {(searchQuery ? searchResults : chats.filter(c => !c.isGroup).map(c => ({
                id: c.id,
                username: c.username || '',
                name: c.name || c.username || '',
                dp: c.dp,
              }))).map((u) => (
                <li
                  key={u.id || u.username}
                  onClick={() => onMemberToggle(u.username)}
                  className="p-2 hover:bg-white/5 rounded-xl cursor-pointer flex gap-3 items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u.username)}
                    onChange={() => {}}
                    className="w-4 h-4 accent-[#FF781F] shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0 border border-[#2a2a2a]">
                    {u.dp ? (
                      <img src={u.dp} className="w-full h-full object-cover" alt="" />
                    ) : (
                      (u.name || u.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.name || u.username}</div>
                    <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <>
            {searchQuery ? (
              <ul className="p-1 space-y-0.5">
                {searchResults.map((u) => (
                  <li key={u.id || u.username}>
                    <button
                      type="button"
                      onClick={() => {
                        onUserSelect(u);
                        onSearchQueryChange('');
                      }}
                      className="w-full p-2 hover:bg-white/5 rounded-xl flex gap-3 items-center text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1f1f1f] flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0 border border-[#2a2a2a]">
                        {u.dp ? (
                          <img src={u.dp} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (u.name || u.username).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{u.name || u.username}</div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="p-1 space-y-0.5">
                {chats.map((c) => (
                  <li
                    key={c.id}
                    className={`group flex gap-0.5 items-stretch rounded-xl hover:bg-white/[0.04] ${
                      selectedUser?.id === c.id ||
                      (!c.isGroup && selectedUser?.username === c.username)
                        ? 'bg-[#FF781F]/10'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onUserSelect(c)}
                      className="flex flex-1 min-w-0 gap-3 items-center p-2.5 text-left rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#3d2818] flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0 border border-[#2a2a2a] text-[#f5e6dc]">
                        {c.dp ? (
                          <img src={c.dp} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (c.name || c.username || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex justify-between gap-2 text-foreground">
                          <span className="truncate">{c.name || c.username}</span>
                          {c.unreadCount > 0 && (
                            <span className="bg-[#FF781F] text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.lastMessage?.unsent
                            ? 'Message removed'
                            : c.lastMessage?.content ||
                              (c.lastMessage?.fileUrl ? 'Photo' : 'No messages yet')}
                        </div>
                      </div>
                    </button>
                    {onDeleteChat && (
                      <button
                        type="button"
                        title="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c);
                        }}
                        className="shrink-0 px-2 my-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {isGroupCreationMode ? (
        <div className="border-t border-[#2a2a2a] p-3 shrink-0 flex gap-2">
          <Button
            variant="outline"
            onClick={onCancelGroupCreation}
            className="flex-1 border-[#2a2a2a] bg-transparent"
          >
            Cancel
          </Button>
          {groupCreationStep === 'select' ? (
            <Button
              onClick={onProceedToNameStep}
              disabled={selectedMembers.length === 0}
              className="flex-1 bg-[#FF781F] text-black hover:bg-[#ff9538] font-semibold"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={onGroupCreate}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className="flex-1 bg-[#FF781F] text-black hover:bg-[#ff9538] font-semibold"
            >
              Create group
            </Button>
          )}
        </div>
      ) : (
        <div className="border-t border-[#2a2a2a] p-3 shrink-0">
          <Button
            type="button"
            onClick={onStartGroupCreation}
            className="w-full h-11 rounded-xl bg-[#FF781F] text-black font-semibold hover:bg-[#ff9538] shadow-none"
          >
            + New Group
          </Button>
        </div>
      )}
    </div>
  );
}
