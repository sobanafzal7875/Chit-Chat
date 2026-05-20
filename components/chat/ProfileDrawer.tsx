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

    reader.onload = () => {
      onDpChange(reader.result as string);
    };

    reader.readAsDataURL(file);

    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Drawer */}
      <aside
        className="
        relative h-full w-full max-w-[430px]
        overflow-hidden
        border-l border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        shadow-[0_8px_60px_rgba(0,0,0,0.45)]
        animate-in slide-in-from-right duration-300
        flex flex-col
      "
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 h-52 w-full bg-[#FF781F]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <p className="text-xs text-white/40 mt-1">
              Manage your account
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-white/10
              bg-white/5
              text-white/60
              backdrop-blur-xl
              transition-all duration-300
              hover:bg-white/10
              hover:text-white
            "
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div
              className="
                relative
                h-32 w-32
                overflow-hidden rounded-full
                border border-white/10
                bg-white/5
                backdrop-blur-2xl
                shadow-[0_0_40px_rgba(255,120,31,0.18)]
              "
            >
              {profileDp ? (
                <img
                  src={profileDp}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                  {(profileName || currentUser.username)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />

            <Button
              type="button"
              onClick={onPickPhoto}
              className="
                mt-5
                rounded-2xl
                border border-white/10
                bg-white/5
                px-5
                backdrop-blur-xl
                transition-all duration-300
                hover:border-[#FF781F]/40
                hover:bg-white/10
                text-white
              "
            >
              Change Photo
            </Button>
          </div>

          {/* Form */}
          <div className="mt-8 space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label className="text-white/50">Username</Label>

              <Input
                value={currentUser.username}
                disabled
                className="
                  h-12 rounded-2xl
                  border border-white/5
                  bg-white/[0.03]
                  text-white/50
                  backdrop-blur-xl
                "
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-white/50">Email</Label>

              <Input
                value={currentUser.email ?? ''}
                disabled
                className="
                  h-12 rounded-2xl
                  border border-white/5
                  bg-white/[0.03]
                  text-white/50
                  backdrop-blur-xl
                "
              />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label className="text-white/70">Display Name</Label>

              <Input
                value={profileName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Your display name"
                className="
                  h-12 rounded-2xl
                  border border-white/10
                  bg-white/5
                  text-white
                  placeholder:text-white/30
                  backdrop-blur-xl
                  transition-all duration-300
                  focus-visible:border-[#FF781F]/60
                  focus-visible:bg-white/10
                  focus-visible:ring-0
                "
              />
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-5">
              <p className="mb-4 text-sm text-white/40">
                Change password
              </p>

              {/* Current Password */}
              <div className="space-y-2">
                <Label className="text-white/70">
                  Current Password
                </Label>

                <Input
                  type="password"
                  value={profileCurrentPassword}
                  onChange={(e) =>
                    onCurrentPasswordChange(e.target.value)
                  }
                  placeholder="Current password"
                  className="
                    h-12 rounded-2xl
                    border border-white/10
                    bg-white/5
                    text-white
                    placeholder:text-white/30
                    backdrop-blur-xl
                    transition-all duration-300
                    focus-visible:border-[#FF781F]/60
                    focus-visible:bg-white/10
                    focus-visible:ring-0
                  "
                />
              </div>

              {/* New Password */}
              <div className="mt-4 space-y-2">
                <Label className="text-white/70">
                  New Password
                </Label>

                <Input
                  type="password"
                  value={profileNewPassword}
                  onChange={(e) =>
                    onNewPasswordChange(e.target.value)
                  }
                  placeholder="New password"
                  className="
                    h-12 rounded-2xl
                    border border-white/10
                    bg-white/5
                    text-white
                    placeholder:text-white/30
                    backdrop-blur-xl
                    transition-all duration-300
                    focus-visible:border-[#FF781F]/60
                    focus-visible:bg-white/10
                    focus-visible:ring-0
                  "
                />
              </div>
            </div>

            {/* Error */}
            {updateError && (
              <div
                className="
                  rounded-2xl
                  border border-red-400/20
                  bg-red-500/10
                  px-4 py-3
                  text-sm text-red-300
                  backdrop-blur-xl
                "
              >
                {updateError}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-3 border-t border-white/10 p-5">
          <Button
            type="button"
            onClick={onClose}
            className="
              flex-1
              rounded-2xl
              border border-white/10
              bg-white/5
              text-white
              backdrop-blur-xl
              transition-all duration-300
              hover:bg-white/10
            "
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onSave}
            disabled={isUpdating || !profileName.trim()}
            className="
              flex-1
              rounded-2xl
              bg-[#FF781F]
              text-black
              font-semibold
              shadow-[0_0_30px_rgba(255,120,31,0.35)]
              transition-all duration-300
              hover:bg-[#ff8c3a]
            "
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </aside>
    </div>
  );
}