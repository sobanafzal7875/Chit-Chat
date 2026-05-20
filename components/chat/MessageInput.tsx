'use client';

import { useRef, useState } from 'react';

interface MessageInputProps {
  newMessage: string;
  fileAttachment: { url: string; type: string } | null;
  selectedUser: any;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileAttach: (file: File) => void;
  onRemoveAttachment: () => void;
}

export function MessageInput({
  newMessage,
  fileAttachment,
  selectedUser,
  onMessageChange,
  onSendMessage,
  onFileAttach,
  onRemoveAttachment,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEmojiHint, setIsEmojiHint] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileAttach(file);
  };

  if (!selectedUser) return null;

  const canSend = !!(newMessage.trim() || fileAttachment);

  return (
    <div className="shrink-0 border-t border-[#1e1e1e] px-3 sm:px-4 py-3 bg-[#0d0d0d]">
      {/* Attachment preview */}
      {fileAttachment && (
        <div className="mb-2.5 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center gap-2.5">
          {fileAttachment.type?.startsWith('image/') ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black/20">
              <img src={fileAttachment.url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#FF781F]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#FF781F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          )}
          <span className="text-[12px] text-muted-foreground truncate flex-1">
            {fileAttachment.url.split('/').pop()}
          </span>
          <button onClick={onRemoveAttachment}
            className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded transition-colors shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Attach button */}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*"/>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-muted-foreground hover:text-[#FF781F] hover:border-[#FF781F]/30 transition-colors"
          title="Attach image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
        </button>

        {/* Text input pill */}
        <div className="flex-1 relative flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 focus-within:border-[#FF781F]/40 transition-colors">
          <input
            type="text"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none py-2.5 pr-8"
          />
          {/* Emoji button (cosmetic) */}
          <button
            type="button"
            title="Emoji"
            className="absolute right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            onClick={() => setIsEmojiHint(!isEmojiHint)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={onSendMessage}
          disabled={!canSend}
          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
            canSend
              ? 'bg-[#FF781F] text-black shadow-[0_0_16px_rgba(255,120,31,0.4)] hover:bg-[#ff9538] hover:shadow-[0_0_20px_rgba(255,120,31,0.5)]'
              : 'bg-[#1a1a1a] border border-[#2a2a2a] text-muted-foreground/30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}