'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jsonAuthHeaders, authHeaders } from '@/lib/client/authFetch';

interface Member {
  username: string;
  name?: string;
  dp?: string;
}

interface GroupProfileDrawerProps {
  isOpen: boolean;
  group: {
    id: string;
    name?: string;
    dp?: string;
    members?: Member[];
    admin?: string;
  } | null;
  currentUser: { username: string };
  onClose: () => void;
  onGroupUpdated: () => void;
  onExitGroup: () => void;
}

export function GroupProfileDrawer({
  isOpen,
  group,
  currentUser,
  onClose,
  onGroupUpdated,
  onExitGroup,
}: GroupProfileDrawerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [dp, setDp] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDp(group.dp || '');
      setError('');
    }
  }, [group]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

useEffect(() => {
  const timer = setTimeout(async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success !== false) {
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

  if (!isOpen || !group) return null;

//   const isAdmin = group.admin === currentUser.username || 
//     (typeof group.admin === 'object' && (group.admin as any)?.username === currentUser.username);
  const adminUsername = typeof group.admin === 'object' 
    ? (group.admin as any)?.username 
    : group.admin;
  const isAdmin = adminUsername === currentUser.username;

  const onPickPhoto = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file?.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => setDp(reader.result as string);
  reader.readAsDataURL(file);
  e.target.value = '';
  };

  const handleSave = async () => {
  if (!name.trim()) return;
  setIsUpdating(true);
  setError('');
  try {
  const res = await fetch(`/api/groups/${group.id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ name: name.trim(), dp: dp || null }),
  });
  const data = await res.json();
    if (res.ok) {
      onGroupUpdated();
      onClose();
    } else {
      setError(data.error || 'Could not update group');
    }
  } catch {
    setError('Something went wrong');
  } finally {
    setIsUpdating(false);
  }
  };

  const handleRemoveMember = async (memberUsername: string) => {
    if (!window.confirm(`Remove ${memberUsername} from group?`)) return;
    try {
      await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ member: memberUsername }),
      });
      onGroupUpdated();
    } catch {
      setError('Could not remove member');
    }
  };

  const handleExit = async () => {
    if (!window.confirm('Exit this group?')) return;
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ member: currentUser.username }),
      });
      if (!res.ok) {
        setError('Could not exit group');
        return;
      }
      onExitGroup();
      onClose();
    } catch {
      setError('Could not exit group');
    }
  };

  const handleAddMember = async (memberUsername: string) => {
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ member: memberUsername }),
      });
      if (res.ok) {
        setSearchQuery('');
        onGroupUpdated();
      } else {
        const data = await res.json();
        setError(data.error || 'Could not add member');
      }
    } catch {
      setError('Could not add member');
    }
  };
  const members = group.members || [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] border-0 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="relative h-full w-full max-w-[420px] bg-[#121212] border-l border-[#2a2a2a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Group Info</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-6">
          {/* Group DP */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-[#3d2818] border-2 border-[#2a2a2a] overflow-hidden flex items-center justify-center text-3xl font-semibold text-[#f5e6dc]">
              {dp ? (
                <img src={dp} alt="" className="w-full h-full object-cover" />
              ) : (
                (name || 'G').charAt(0).toUpperCase()
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" onClick={onPickPhoto} className="border-[#2a2a2a] bg-[#1a1a1a]">
              Change photo
            </Button>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Group name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0d0d0d] border-[#2a2a2a]"
              placeholder="Group name"
            />
          </div>

          {/* Members */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">{members.length} Members</Label>
            <div className="space-y-1">
              {members.map((m) => {
                const username = typeof m === 'string' ? m : m.username;
                const memberName = typeof m === 'object' ? (m.name || username) : username;
                const memberDp = typeof m === 'object' ? m.dp : undefined;
                // const isGroupAdmin = group.admin === username || 
                //   (typeof group.admin === 'object' && (group.admin as any)?.username === username);
                const isGroupAdmin = adminUsername === username;

                return (
                  <div key={username} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                    <div className="w-9 h-9 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                      {memberDp ? (
                        <img src={memberDp} className="w-full h-full object-cover" alt="" />
                      ) : (
                        memberName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {memberName}
                        {username === currentUser.username && <span className="text-muted-foreground"> (you)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">@{username}</div>
                    </div>
                    {isGroupAdmin && (
                      <span className="text-xs bg-[#FF781F]/20 text-[#FF781F] px-2 py-0.5 rounded-full shrink-0">Admin</span>
                    )}
                    {isAdmin && username !== currentUser.username && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(username)}
                        className="text-muted-foreground hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

{/* Add Members */}
{isAdmin && (
  <div className="space-y-3">
    <Label className="text-muted-foreground">Add Members</Label>
    <div className="relative">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
        className="bg-[#0d0d0d] border-[#2a2a2a]"
      />
      {searchQuery && (
        isSearching ? (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-muted-foreground z-10">
            Searching...
          </div>
        ) : searchResults.filter((u) => !members.some((m: any) => (m.username || m) === u.username)).length > 0 ? (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-10">
            {searchResults
              .filter((u) => !members.some((m: any) => (m.username || m) === u.username))
              .map((u) => (
                <div key={u._id} className="flex items-center justify-between p-2 hover:bg-white/5 border-b border-[#2a2a2a] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-xs overflow-hidden">
                      {u.dp ? <img src={u.dp} className="w-full h-full object-cover" alt="" /> : u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{u.name}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[#FF781F]" onClick={() => handleAddMember(u.username)}>
                    Add
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-muted-foreground z-10">
            No users found
          </div>
        )
      )}
    </div>
  </div>
)}

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2a] shrink-0 space-y-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUpdating || !name.trim()}
            className="w-full bg-[#FF781F] text-black hover:bg-[#ff8c3a] font-semibold"
          >
            {isUpdating ? 'Saving…' : 'Save changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExit}
            className="w-full border-red-900/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Exit Group
          </Button>
        </div>
      </aside>
    </div>
  );
}