'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { MessageInput } from '@/components/chat/MessageInput';
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
  onBack?: () => void; // ✅ ADD
  onGroupProfileClick?: () => void
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
  onBack, // ✅ ADD
  onGroupProfileClick,
  // onGroupProfileClick={() => setIsGroupProfileOpen(true)}

}: ChatRoomPanelProps) {
  return (
    <div className={`md:col-span-3 bg-[#121212] rounded-2xl border border-[#2a2a2a] overflow-hidden flex flex-col h-full min-h-0 ${
  !selectedUser ? 'hidden md:flex' : 'flex'
}`}>
      {selectedUser && (
        <ChatHeader
          selectedUser={selectedUser}
          callAccepted={callAccepted}
          calling={calling}
          isWatchTogether={isWatchTogether}
          onCall={() => onCall(selectedUser)}
          onWatchTogether={() => onWatchTogether(selectedUser)}
          onGroupProfileClick={onGroupProfileClick}
        />
      )}

      <ChatMessages
        messages={messages}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onUnsend={onUnsendMessage}
        onBack={onBack} // ✅ ADD
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
