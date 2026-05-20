'use client';

import { useState } from 'react';

interface UserProfilePanelProps {
  selectedUser: {
    username?: string;
    name?: string;
    dp?: string;
    isGroup?: boolean;
    members?: any[];
  } | null;
  messages: any[];
  onClose?: () => void;
}

export function UserProfilePanel({ selectedUser, messages, onClose }: UserProfilePanelProps) {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [disappearing, setDisappearing] = useState(false);

  if (!selectedUser) return null;

  // Collect media from messages
  const mediaMessages = messages.filter(
    (m) => m.fileUrl && m.fileType?.startsWith('image/') && !m.unsent
  ).slice(-6);

  const linkMessages = messages.filter(
    (m) => !m.fileUrl && m.content && (m.content.includes('http://') || m.content.includes('https://'))
  ).slice(-4);

  return (
    <div className="hidden xl:flex flex-col w-[260px] shrink-0  border-white/[0.06] bg-white/[0.04] backdrop-blur-xs h-full overflow-hidden">
      {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      {/* Profile top */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-[#1e1e1e]">
        <div className="w-16 h-16 rounded-full bg-[#2a1f15] border-2 border-[#2a2a2a] flex items-center justify-center text-xl font-bold overflow-hidden text-[#f5e6dc] mb-3">
          {selectedUser.dp
            ? <img src={selectedUser.dp} alt="" className="w-full h-full object-cover" />
            : (selectedUser.name || selectedUser.username || 'U').charAt(0).toUpperCase()
          }
        </div>
        <h3 className="font-semibold text-[14px] text-foreground truncate max-w-full">
          {selectedUser.name || selectedUser.username}
        </h3>
        <p className="text-[11px] text-green-400/80 mt-0.5">
          {selectedUser.isGroup ? `${selectedUser.members?.length || 0} members` : 'Online'}
        </p>

        {/* Quick action icons */}
        {!selectedUser.isGroup && (
          <div className="flex items-center gap-4 mt-4">
            {[
              {
                label: 'Voice Call',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                ),
              },
              {
                label: 'Video Call',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                ),
              },
              {
                label: 'Search',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                  </svg>
                ),
              },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                title={action.label}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-muted-foreground group-hover:text-[#FF781F] group-hover:border-[#FF781F]/30 group-hover:bg-[#FF781F]/10 transition-all">
                  {action.icon}
                </div>
                <span className="text-[9px] text-muted-foreground/50 group-hover:text-[#FF781F]/70 transition-colors">
                  {action.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Media, Links & Files */}
        <div className="px-4 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold text-foreground">Media, Links & Files</span>
            {mediaMessages.length > 0 && (
              <button type="button" className="text-[11px] text-[#FF781F] hover:text-[#ff9538] transition-colors">
                View all
              </button>
            )}
          </div>

          {mediaMessages.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {mediaMessages.map((m, i) => (
                <div key={m._id || i} className="aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]">
                  <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-muted-foreground/30">
              <svg className="w-8 h-8 mb-1.5 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-[11px]">No media yet</p>
            </div>
          )}
        </div>

        {/* Links */}
        {linkMessages.length > 0 && (
          <div className="px-4 py-4 border-b border-[#1e1e1e] space-y-2">
            <span className="text-[12px] font-semibold text-foreground block mb-3">Shared Links</span>
            {linkMessages.map((m, i) => {
              const url = m.content.match(/https?:\/\/[^\s]+/)?.[0] || '';
              return (
                <a key={m._id || i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-[#FF781F]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#FF781F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate group-hover:text-foreground transition-colors">{url}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Settings toggles */}
        <div className="px-4 py-4 space-y-1">
          {[
            {
              label: 'Notifications',
              value: notificationsOn,
              toggle: () => setNotificationsOn((v) => !v),
              activeColor: 'text-[#FF781F]',
              activeLabel: 'On',
              inactiveLabel: 'Off',
            },
            {
              label: 'Chat Theme',
              value: darkTheme,
              toggle: () => setDarkTheme((v) => !v),
              activeColor: 'text-[#FF781F]',
              activeLabel: '',
              inactiveLabel: '',
              isTheme: true,
            },
            {
              label: 'Disappearing Messages',
              value: disappearing,
              toggle: () => setDisappearing((v) => !v),
              activeColor: 'text-[#FF781F]',
              activeLabel: 'On',
              inactiveLabel: 'Off',
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.toggle}
              className="w-full flex items-center justify-between py-2.5 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] text-foreground/80 group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
              </div>
              {item.isTheme ? (
                <div className={`w-4 h-4 rounded-full border-2 ${item.value ? 'bg-[#FF781F] border-[#FF781F]' : 'bg-transparent border-[#3a3a3a]'} transition-all`} />
              ) : (
                <span className={`text-[12px] font-medium transition-colors ${item.value ? 'text-[#FF781F]' : 'text-muted-foreground/50'}`}>
                  {item.value ? item.activeLabel : item.inactiveLabel}
                </span>
              )}
            </button>
          ))}

          {/* Privacy & Security */}
          <button type="button" className="w-full flex items-center justify-between py-2.5 group">
            <span className="text-[12px] text-foreground/80 group-hover:text-foreground transition-colors">Privacy & Security</span>
            <svg className="w-3.5 h-3.5 text-muted-foreground/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Divider */}
          <div className="h-px bg-[#1e1e1e] my-1" />

          {/* Block user */}
          <button type="button" className="w-full flex items-center gap-2.5 py-2.5 group">
            <svg className="w-4 h-4 text-red-500/70 group-hover:text-red-400 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M4.93 4.93l14.14 14.14"/>
            </svg>
            <span className="text-[12px] text-red-500/70 group-hover:text-red-400 transition-colors">Block User</span>
          </button>
        </div>
      </div>
    </div>
  );
}