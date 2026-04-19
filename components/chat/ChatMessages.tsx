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
}

function senderUsername(sender: Message['sender']): string {
  if (typeof sender === 'object' && sender !== null && 'username' in sender) {
    return sender.username;
  }
  return String(sender);
}

function senderDisplayName(sender: Message['sender'], members: GroupMember[]): string {
  const u = senderUsername(sender);
  if (typeof sender === 'object' && sender !== null && 'name' in sender && sender.name) {
    return sender.name;
  }
  const m = members.find((x) => x.username === u);
  return m?.name || u;
}

export function ChatMessages({
  messages,
  currentUser,
  selectedUser,
  onUnsend,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxUrl, closeLightbox]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const members = selectedUser?.members ?? [];
  const isGroup = Boolean(selectedUser?.isGroup);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent">
        {messages.map((msg, idx) => {
          const senderName = senderUsername(msg.sender);
          const isOwnMessage = senderName === currentUser.username;
          const prevSender = idx > 0 ? senderUsername(messages[idx - 1].sender) : '';
          const showAvatar = !isOwnMessage && (idx === 0 || prevSender !== senderName);
          const showGroupSender =
            isGroup && (idx === 0 || prevSender !== senderName);
          const member = members.find((m) => m.username === senderName);
          const avatarSrc = isGroup ? member?.dp : selectedUser.dp;
          const avatarLetter = (
            (isGroup ? member?.name : selectedUser.name) ||
            senderName
          )
            .charAt(0)
            .toUpperCase();

          const isUnsent = Boolean(msg.unsent);
          const hasImage =
            Boolean(msg.fileUrl) && msg.fileType?.startsWith('image/') && !isUnsent;
          const hasCaption = Boolean(msg.content?.trim());
          const imageOnly = hasImage && !hasCaption;
          const imageCaptionCombo = hasImage && hasCaption;

          return (
            <Fragment key={msg._id}>
              {showGroupSender && (
                <div
                  className={`text-[11px] font-semibold text-muted-foreground ${
                    isOwnMessage ? 'text-right pr-1' : 'pl-11'
                  }`}
                >
                  {senderDisplayName(msg.sender, members)}
                  {isOwnMessage ? ' (you)' : ''}
                </div>
              )}

              <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                  <div className="w-8 shrink-0 flex justify-center mt-1">
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                        {avatarSrc ? (
                          <img src={avatarSrc} className="w-full h-full object-cover" alt="" />
                        ) : (
                          avatarLetter
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className={`max-w-[min(100%,280px)] ${isOwnMessage ? 'order-first' : ''}`}>
                  <div
                    className={
                      isUnsent
                        ? `rounded-xl px-3 py-2 ${
                            isOwnMessage
                              ? 'bg-primary/90 text-primary-foreground'
                              : 'bg-muted'
                          }`
                        : imageCaptionCombo
                          ? ''
                          : imageOnly
                            ? `overflow-hidden rounded-xl ${
                                isOwnMessage
                                  ? 'ring-1 ring-primary/25'
                                  : 'ring-1 ring-border/60'
                              }`
                            : `rounded-xl px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`
                    }
                  >
                    {isUnsent ? (
                      <p
                        className={`text-sm italic opacity-80 px-1 py-0.5 ${
                          isOwnMessage ? '' : ''
                        }`}
                      >
                        This message was removed
                      </p>
                    ) : msg.fileUrl ? (
                      <div>
                        {hasImage ? (
                          hasCaption ? (
                            <div
                              className={`overflow-hidden rounded-xl max-w-[240px] ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground ring-1 ring-primary/25'
                                  : 'bg-muted ring-1 ring-border/50'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(msg.fileUrl!)}
                                className="block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                              >
                                <div className="aspect-[4/5] w-full bg-black/10">
                                  <img
                                    src={msg.fileUrl}
                                    alt=""
                                    className="w-full h-full object-cover block"
                                    draggable={false}
                                  />
                                </div>
                              </button>
                              <p className="text-sm whitespace-pre-wrap px-3 py-2 border-t border-black/10 dark:border-white/10">
                                {msg.content}
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(msg.fileUrl!)}
                              className="block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50 overflow-hidden max-w-[240px] ring-1 ring-border/60 dark:ring-border/80"
                            >
                              <div className="aspect-[4/5] w-full bg-black/5">
                                <img
                                  src={msg.fileUrl}
                                  alt=""
                                  className="w-full h-full object-cover block"
                                  draggable={false}
                                />
                              </div>
                            </button>
                          )
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline hover:no-underline truncate"
                            >
                              View attachment
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  <div
                    className={`text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>
                      {formatTime(msg.createdAt)}
                      {isOwnMessage && !isUnsent && (
                        <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                      )}
                    </span>
                    {isOwnMessage && !isUnsent && onUnsend && (
                      <button
                        type="button"
                        onClick={() => onUnsend(msg._id)}
                        className="text-[11px] font-medium text-muted-foreground hover:text-destructive underline-offset-2 hover:underline"
                      >
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

      {lightboxUrl && (
        <button
          type="button"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 border-0 cursor-default"
          onClick={closeLightbox}
          aria-label="Close image"
        >
          <img
            src={lightboxUrl}
            alt=""
            className="max-h-[92vh] max-w-full w-auto h-auto object-contain shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute top-4 right-4 text-white/80 text-sm">Esc or click outside to close</span>
        </button>
      )}
    </>
  );
}
