'use client';

import { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';

interface Message extends ChatMessage {}

interface GroupMember {
  username: string;
  name?: string;
  dp?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUser: { username: string; name?: string; dp?: string };
  selectedUser: {
    username?: string;
    name?: string;
    dp?: string;
    isGroup?: boolean;
    members?: GroupMember[];
  } | null;
  onUnsend?: (messageId: string) => void;
  onBack?: () => void;
}

function senderUsername(sender: Message['sender']): string {
  if (typeof sender === 'object' && sender !== null && 'username' in sender) return sender.username;
  return String(sender);
}

function senderDisplayName(sender: Message['sender'], members: GroupMember[]): string {
  const u = senderUsername(sender);
  if (typeof sender === 'object' && sender !== null && 'name' in sender && sender.name) return sender.name;
  const m = members.find((x) => x.username === u);
  return m?.name || u;
}

// Group messages by date
function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

export function ChatMessages({
  messages,
  currentUser,
  selectedUser,
  onUnsend,
  onBack,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxUrl, closeLightbox]);

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const members = selectedUser?.members ?? [];
  const isGroup = Boolean(selectedUser?.isGroup);

  // Empty / no selection state
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center relative z-30">
        <div className="text-center space-y-3">
          <div className="w-30 h-15 rounded-full flex items-center justify-center mx-auto">
            <img
              src="/NexoraLogo.png"
              alt="Nexora Logo"
              className="w-30 h-30 opacity-80 object-contain select-none pointer-events-none"
            />
          </div>
          <p className="text-[14px] text-muted-foreground/70">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile back bar */}
      {onBack && (
        <div className="md:hidden shrink-0 px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        </div>
      )}

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1 reltive z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground/40">
            <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p className="text-[12px]">No messages yet. Say hi! 👋</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const senderName = senderUsername(msg.sender);
          const isOwn = senderName === currentUser.username;
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const prevSender = prevMsg ? senderUsername(prevMsg.sender) : '';
          const nextSender = nextMsg ? senderUsername(nextMsg.sender) : '';

          const isFirstInGroup = prevSender !== senderName;
          const isLastInGroup = nextSender !== senderName;

          const showAvatar = !isOwn && isFirstInGroup;
          const showGroupSender = isGroup && isFirstInGroup;

          const member = members.find((m) => m.username === senderName);
          const avatarSrc = isGroup ? member?.dp : selectedUser.dp;
          const avatarLetter = ((isGroup ? member?.name : selectedUser.name) || senderName).charAt(0).toUpperCase();

          const isUnsent = Boolean(msg.unsent);
          const hasImage = Boolean(msg.fileUrl) && msg.fileType?.startsWith('image/') && !isUnsent;
          const hasCaption = Boolean(msg.content?.trim());
          const imageOnly = hasImage && !hasCaption;
          const imageCaptionCombo = hasImage && hasCaption;

          // Date separator
          const showDateSep = idx === 0 ||
            getDateLabel(msg.createdAt) !== getDateLabel(messages[idx - 1].createdAt);

          // Bubble rounding: WhatsApp-style grouped
          const ownRadius = `rounded-2xl ${isFirstInGroup ? 'rounded-tr-md' : ''} ${isLastInGroup ? 'rounded-tr-2xl' : 'rounded-tr-md'}`;
          const otherRadius = `rounded-2xl ${isFirstInGroup ? 'rounded-tl-md' : ''} ${isLastInGroup ? 'rounded-tl-2xl' : 'rounded-tl-md'}`;

          return (
            <Fragment key={msg._id}>
              {/* Date separator */}
              {showDateSep && (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                  <span className="text-[11px] text-muted-foreground/50 shrink-0 px-1">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>
              )}

              {/* Group sender name */}
              {showGroupSender && (
                <div className={`text-[11px] font-semibold text-[#FF781F]/70 mb-0.5 ${isOwn ? 'text-right pr-1' : 'pl-11'}`}>
                  {senderDisplayName(msg.sender, members)}{isOwn ? ' (you)' : ''}
                </div>
              )}

              {/* Message row */}
              <div
                className={`flex gap-2 items-end ${isOwn ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}
                onMouseEnter={() => setHoveredId(msg._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Avatar */}
                {!isOwn && (
                  <div className="w-7 shrink-0 self-end mb-0.5">
                    {isLastInGroup ? (
                      <div className="w-7 h-7 rounded-full bg-[#2a1f15] border border-[#2a2a2a] flex items-center justify-center text-[11px] font-bold overflow-hidden text-[#f5e6dc]">
                        {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" /> : avatarLetter}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[min(75%,320px)] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {isUnsent ? (
                    <div className={`px-3 py-2 rounded-2xl border border-dashed ${isOwn ? 'border-[#FF781F]/30 bg-[#FF781F]/5' : 'border-[#2a2a2a] bg-[#1a1a1a]'}`}>
                      <p className="text-[12px] italic text-muted-foreground/50">Message removed</p>
                    </div>
                  ) : hasImage ? (
                    imageCaptionCombo ? (
                      <div className={`overflow-hidden rounded-2xl max-w-[240px] ${isOwn ? 'bg-[#FF781F]' : 'bg-[#1e1e1e] border border-[#2a2a2a]'}`}>
                        <button type="button" onClick={() => setLightboxUrl(msg.fileUrl!)}
                          className="block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in outline-none">
                          <div className="aspect-[4/5] w-full bg-black/10">
                            <img src={msg.fileUrl} alt="" className="w-full h-full object-cover block" draggable={false}/>
                          </div>
                        </button>
                        <p className={`text-[13px] whitespace-pre-wrap px-3 py-2 border-t ${isOwn ? 'border-white/10 text-black' : 'border-[#2a2a2a]'}`}>
                          {msg.content}
                        </p>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setLightboxUrl(msg.fileUrl!)}
                        className="block p-0 m-0 border-0 bg-transparent cursor-zoom-in rounded-2xl overflow-hidden outline-none max-w-[240px]">
                        <div className="aspect-[4/5] w-full bg-black/10">
                          <img src={msg.fileUrl} alt="" className="w-full h-full object-cover block" draggable={false}/>
                        </div>
                      </button>
                    )
                  ) : msg.fileUrl ? (
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl ${isOwn ? 'bg-[#FF781F]' : 'bg-[#1e1e1e] border border-[#2a2a2a]'}`}>
                      <svg className={`w-4 h-4 shrink-0 ${isOwn ? 'text-black/70' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                        className={`text-[13px] underline hover:no-underline truncate ${isOwn ? 'text-black' : ''}`}>
                        View attachment
                      </a>
                    </div>
                  ) : (
                    <div className={`px-3 py-2 ${isOwn ? `bg-[#FF781F] text-black ${ownRadius}` : `bg-[#1e1e1e] border border-[#242424] text-foreground ${otherRadius}`}`}>
                      <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  )}

                  {/* Time + read + unsend */}
                  <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-muted-foreground/50">{formatTime(msg.createdAt)}</span>
                    {isOwn && !isUnsent && (
                      <span className={`text-[10px] font-bold ${msg.read ? 'text-[#FF781F]' : 'text-muted-foreground/40'}`}>
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                    {isOwn && !isUnsent && onUnsend && hoveredId === msg._id && (
                      <button type="button" onClick={() => onUnsend(msg._id)}
                        className="text-[10px] text-muted-foreground/50 hover:text-red-400 transition-colors underline-offset-2 hover:underline">
                        Unsend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <button type="button"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 border-0 cursor-default"
          onClick={closeLightbox} aria-label="Close image">
          <img src={lightboxUrl} alt=""
            className="max-h-[92vh] max-w-full w-auto h-auto object-contain shadow-2xl rounded-xl"
            onClick={(e) => e.stopPropagation()}/>
          <span className="absolute top-4 right-4 text-white/40 text-[12px]">Esc or click outside to close</span>
        </button>
      )}
    </>
  );
}