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
  onBack?: () => void;
  onGroupProfileClick?: () => void;
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
  onGroupProfileClick,
}: ChatRoomPanelProps) {
  return (
    <div className={`md:col-span-3 border-r border-white/[0.06] bg-white/[0.04] backdrop-blur-xs border  overflow-hidden flex flex-col h-full min-h-0 ${
      !selectedUser ? 'hidden md:flex' : 'flex'
    }`}>
      {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF781F]/40 to-transparent" />
      {selectedUser ? (
        <ChatHeader
          selectedUser={selectedUser}
          callAccepted={callAccepted}
          calling={calling}
          isWatchTogether={isWatchTogether}
          onCall={() => onCall(selectedUser)}
          onWatchTogether={() => onWatchTogether(selectedUser)}
          onBack={onBack}
          onGroupProfileClick={onGroupProfileClick}
        />
      ) : null}

      <ChatMessages
        messages={messages}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onUnsend={onUnsendMessage}
        onBack={onBack}
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