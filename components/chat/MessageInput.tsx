'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileAttach(file);
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="shrink-0 border-t border-[#2a2a2a] p-3 sm:p-4 bg-[#0d0d0d]">
      {fileAttachment && (
        <div className="mb-3 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm truncate">{fileAttachment.url.split('/').pop()}</span>
          </div>
          <button
            onClick={onRemoveAttachment}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,application/*"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </Button>

        <div className="flex-1 relative">
          <Input
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-12 bg-[#121212] border-[#2a2a2a]"
          />
        </div>

        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() && !fileAttachment}
          size="sm"
          className="shrink-0 bg-[#FF781F] text-black hover:bg-[#ff9538] font-semibold disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </div>
    </div>
  );
}