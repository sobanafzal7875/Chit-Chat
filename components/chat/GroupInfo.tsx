'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatUser } from '@/types/chat';

export interface GroupInfoProps {
  group: ChatUser;
  isAdmin: boolean;
  currentUserUsername: string;
  onBack: () => void;
  onGroupNameUpdate?: (newName: string) => void;
  onGroupDpUpdate?: (newDp: string) => void;
  onRemoveMember?: (username: string) => void;
  onAddMembers?: () => void;
}

export function GroupInfo({
  group,
  isAdmin,
  currentUserUsername,
  onBack,
  onGroupNameUpdate,
  onGroupDpUpdate,
  onRemoveMember,
  onAddMembers,
}: GroupInfoProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(group.name || '');

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== group.name) {
      await onGroupNameUpdate?.(editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onGroupDpUpdate?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between bg-[#0d0d0d]">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground"
          title="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-foreground">Group Info</h3>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Group Profile */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-[#1f1f1f] flex items-center justify-center font-semibold text-2xl overflow-hidden border-2 border-[#2a2a2a]">
              {group.dp ? (
                <img src={group.dp} className="w-full h-full object-cover" alt="" />
              ) : (
                (group.name || group.username).charAt(0).toUpperCase()
              )}
            </div>
            {isAdmin && (
              <label
                htmlFor="group-dp-upload"
                className="absolute bottom-0 right-0 p-2 bg-[#FF781F] text-black rounded-full hover:bg-[#ff9538] cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input
                  id="group-dp-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Group Name */}
          <div className="mt-4">
            {isEditingName && isAdmin ? (
              <div className="flex gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-[#0d0d0d] border-[#2a2a2a] text-center"
                  autoFocus
                />
                <Button
                  onClick={handleSaveName}
                  className="px-3 bg-[#FF781F] text-black hover:bg-[#ff9538]"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingName(false)}
                  className="px-3 border-[#2a2a2a] bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div
                onClick={() => isAdmin && setIsEditingName(true)}
                className={`text-xl font-semibold ${isAdmin ? 'cursor-pointer hover:text-[#FF781F]' : ''}`}
              >
                {group.name || group.username}
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">Members ({group.members?.length || 0})</h4>
            {isAdmin && (
              <Button
                onClick={onAddMembers}
                className="px-3 py-1 bg-[#FF781F] text-black hover:bg-[#ff9538] text-sm"
              >
                Add
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {group.members?.map((member) => (
              <div
                key={member.username}
                className="p-3 rounded-xl bg-[#0d0d0d] border border-[#2a2a2a] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0 border border-[#2a2a2a]">
                    {member.dp ? (
                      <img src={member.dp} className="w-full h-full object-cover" alt="" />
                    ) : (
                      (member.name || member.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {member.name || member.username}
                      {member.username === currentUserUsername && ' (you)'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">@{member.username}</div>
                  </div>
                </div>
                {isAdmin && member.username !== currentUserUsername && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember?.(member.username)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 shrink-0"
                    title="Remove member"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
