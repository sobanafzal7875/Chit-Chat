'use client';

import { useState } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { MessageInput } from '@/components/chat/MessageInput';
import { GroupInfo } from '@/components/chat/GroupInfo';
import type { ChatMessage, ChatUser } from '@/types/chat';

export interface ChatRoomPanelProps {
  currentUser: { username: string; name?: string; dp?: string; email?: string };
  selectedUser: ChatUser | null;
  messages: ChatMessage[];
  newMessage: string;
  fileAttachment: { url: string; type: string } | null;
  callAccepted: boolean;
  calling: boolean;
  isWatchTogether: boolean;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onFileAttach: (file: File) => void;
  onRemoveAttachment: () => void;
  onCall: (user: ChatUser) => void;
  onWatchTogether: (user: ChatUser) => void;
  onUnsendMessage?: (messageId: string) => void;
  onBack?: () => void;
}

export function ChatRoomPanel({
  currentUser,
  selectedUser,
  messages,
  newMessage,
  fileAttachment,
  callAccepted,
  calling,
  isWatchTogether,
  onNewMessageChange,
  onSendMessage,
  onFileAttach,
  onRemoveAttachment,
  onCall,
  onWatchTogether,
  onUnsendMessage,
  onBack,
}: ChatRoomPanelProps) {
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  if (!selectedUser) {
    return (
      <div className="md:col-span-3 bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden flex flex-col h-full min-h-0 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  if (isGroupInfoOpen && selectedUser.isGroup) {
    return (
      <div className="md:col-span-3">
        <GroupInfo
          group={selectedUser}
          isAdmin={selectedUser.members?.some(m => m.username === currentUser.username) ?? false}
          currentUserUsername={currentUser.username}
          onBack={() => setIsGroupInfoOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="md:col-span-3 bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden flex flex-col h-full min-h-0">
      {selectedUser && (
        <ChatHeader
          selectedUser={selectedUser}
          callAccepted={callAccepted}
          calling={calling}
          isWatchTogether={isWatchTogether}
          onCall={() => onCall(selectedUser)}
          onWatchTogether={() => onWatchTogether(selectedUser)}
          onBack={onBack}
          onGroupInfoClick={() => setIsGroupInfoOpen(true)}
        />
      )}

      <ChatMessages
        messages={messages}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onUnsend={onUnsendMessage}
      />

      {selectedUser && (
        <MessageInput
          newMessage={newMessage}
          fileAttachment={fileAttachment}
          selectedUser={selectedUser}
          onMessageChange={onNewMessageChange}
          onSendMessage={onSendMessage}
          onFileAttach={onFileAttach}
          onRemoveAttachment={onRemoveAttachment}
        />
      )}
    </div>
  );
}
