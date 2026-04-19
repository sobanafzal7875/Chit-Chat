'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ProfileDrawerProps {
  isOpen: boolean;
  currentUser: {
    username: string;
    name?: string;
    email?: string;
    dp?: string;
  };
  profileName: string;
  profileDp: string;
  profileCurrentPassword: string;
  profileNewPassword: string;
  isUpdating: boolean;
  updateError: string;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onDpChange: (dp: string) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onSave: () => void;
}

export function ProfileDrawer({
  isOpen,
  currentUser,
  profileName,
  profileDp,
  profileCurrentPassword,
  profileNewPassword,
  isUpdating,
  updateError,
  onClose,
  onNameChange,
  onDpChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSave,
}: ProfileDrawerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onPickPhoto = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onDpChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] border-0 cursor-default"
        onClick={onClose}
        aria-label="Close profile"
      />
      <aside
        className="relative h-full w-full max-w-[420px] bg-[#121212] border-l border-[#2a2a2a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal
        aria-labelledby="profile-drawer-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] shrink-0">
          <h2 id="profile-drawer-title" className="text-lg font-semibold text-foreground">
            Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-[#1f1f1f] border-2 border-[#2a2a2a] overflow-hidden flex items-center justify-center text-3xl font-semibold text-muted-foreground">
              {profileDp ? (
                <img src={profileDp} alt="" className="w-full h-full object-cover" />
              ) : (
                (profileName || currentUser.username).charAt(0).toUpperCase()
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" onClick={onPickPhoto} className="border-[#2a2a2a] bg-[#1a1a1a]">
              Change photo
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Username</Label>
              <Input value={currentUser.username} readOnly disabled className="bg-[#0d0d0d] border-[#2a2a2a] opacity-90" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input
                value={currentUser.email ?? ''}
                readOnly
                disabled
                className="bg-[#0d0d0d] border-[#2a2a2a] opacity-90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-name">Display name</Label>
              <Input
                id="drawer-name"
                value={profileName}
                onChange={(e) => onNameChange(e.target.value)}
                className="bg-[#0d0d0d] border-[#2a2a2a]"
                placeholder="Your name"
              />
            </div>

            <div className="pt-2 border-t border-[#2a2a2a] space-y-3">
              <p className="text-sm text-muted-foreground">Change password (optional)</p>
              <div className="space-y-2">
                <Label htmlFor="drawer-cur-pw">Current password</Label>
                <Input
                  id="drawer-cur-pw"
                  type="password"
                  autoComplete="current-password"
                  value={profileCurrentPassword}
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  className="bg-[#0d0d0d] border-[#2a2a2a]"
                  placeholder="Required if setting new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawer-new-pw">New password</Label>
                <Input
                  id="drawer-new-pw"
                  type="password"
                  autoComplete="new-password"
                  value={profileNewPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  className="bg-[#0d0d0d] border-[#2a2a2a]"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            {updateError ? (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                {updateError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-4 border-t border-[#2a2a2a] shrink-0 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[#2a2a2a]">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isUpdating || !profileName.trim()}
            className="flex-1 bg-[#FF781F] text-black hover:bg-[#ff8c3a] font-semibold"
          >
            {isUpdating ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
