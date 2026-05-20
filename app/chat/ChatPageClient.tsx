'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatRoomPanel } from '@/components/chat/ChatRoomPanel';
import { ProfileDrawer } from '@/components/chat/ProfileDrawer';
import { CallModal } from '@/components/chat/CallModal';
import { ActiveCallUI } from '@/components/chat/ActiveCallUI';
import { WatchTogetherOverlay } from '@/components/chat/WatchTogetherOverlay';
import { GroupProfileDrawer } from '@/components/chat/GroupProfileDrawer';
import dynamic from 'next/dynamic'

const GlobeScene = dynamic(() => import('@/components/Landing/GlobeScene'), {
  ssr: false,
})

export default function ChatPageClient() {
  const [activeSection, setActiveSection] = useState<'chats' | 'calls' | 'watch' | 'groups' | 'encrypted'>('chats');

  const {
    currentUser,
    chats,
    searchQuery,
    searchResults,
    isSearching,
    selectedUser,
    messages,
    newMessage,
    fileAttachment,
    isProfileOpen,
    profileName,
    profileDp,
    profileCurrentPassword,
    profileNewPassword,
    profileUpdateError,
    isUpdating,
    isGroupCreationMode,
    groupCreationStep,
    groupName,
    selectedMembers,
    receivingCall,
    caller,
    callAccepted,
    callEnded,
    calling,
    isWatchTogether,
    watchTogetherSession,
    watchTogetherParticipants,
    isScreenSharing,
    isWatchTogetherAdmin,
    mutedParticipants,
    myAudio,
    userAudio,
    screenStream,
    setSearchQuery,
    setSearchResults,
    searchUsers,
    selectUser,
    setNewMessage,
    sendMessage,
    handleFileAttach,
    setFileAttachment,
    setProfileName,
    setProfileDp,
    setProfileCurrentPassword,
    setProfileNewPassword,
    handleProfileUpdate,
    closeProfile,
    openProfile,
    logout,
    startGroupCreation,
    setIsGroupCreationMode,
    createGroup,
    setGroupCreationStep,
    setGroupName,
    setSelectedMembers,
    callUser,
    answerCall,
    answerWatchTogether,
    endCall,
    startWatchTogether,
    endWatchTogether,
    startScreenShare,
    addParticipantToWatchTogether,
    removeParticipantFromWatchTogether,
    toggleParticipantMute,
    toggleSelfMute,
    deleteChat,
    unsendMessage,
    setSelectedUser,
    isGroupProfileOpen,
    setIsGroupProfileOpen,
    fetchRecentChats,
    setMessages,
  } = useChat();

  if (!currentUser) {
    return (
      <div className="h-dvh max-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2a2a2a] border-t-[#FF781F] mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
<div className="h-dvh max-h-[100dvh] overflow-hidden flex bg-black text-foreground relative">

  {/* Globe background */}
  <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
    <GlobeScene scrollProgress={{ current: 0 }} /> 
     </div>

       <audio ref={myAudio} autoPlay muted className="hidden" />
      <audio ref={userAudio} autoPlay className="hidden" />

      {/* Left Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onProfileClick={openProfile}
        onLogout={logout}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col h-full pb-14 md:pb-0">
        <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-3 sm:px-4 pb-3 pt-3 flex flex-col">
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-4 gap-3">
            <ChatSidebar
              chats={chats}
              searchQuery={searchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              selectedUser={selectedUser}
              currentUser={currentUser}
              isGroupCreationMode={isGroupCreationMode}
              groupCreationStep={groupCreationStep}
              groupName={groupName}
              selectedMembers={selectedMembers}
              onSearchQueryChange={setSearchQuery}
              onSearchUsers={searchUsers}
              onUserSelect={selectUser}
              onGroupCreate={createGroup}
              onStartGroupCreation={startGroupCreation}
              onCancelGroupCreation={() => {
                setIsGroupCreationMode(false);
                setGroupCreationStep('select');
                setSelectedMembers([]);
                setGroupName('');
                setSearchQuery('');
                setSearchResults([]);
              }}
              onProceedToNameStep={() => {
                if (selectedMembers.length === 0) return;
                setGroupCreationStep('name');
              }}
              onGroupNameChange={setGroupName}
              onMemberToggle={(username) => {
                if (selectedMembers.includes(username)) {
                  setSelectedMembers((p) => p.filter((m) => m !== username));
                } else {
                  setSelectedMembers((p) => [...p, username]);
                }
              }}
              onDeleteChat={deleteChat}
            />

            <ChatRoomPanel
              currentUser={currentUser}
              selectedUser={selectedUser}
              messages={messages}
              newMessage={newMessage}
              fileAttachment={fileAttachment}
              callAccepted={callAccepted}
              calling={calling}
              isWatchTogether={isWatchTogether}
              onNewMessageChange={setNewMessage}
              onSendMessage={sendMessage}
              onFileAttach={handleFileAttach}
              onRemoveAttachment={() => setFileAttachment(null)}
              onCall={callUser}
              onWatchTogether={startWatchTogether}
              onUnsendMessage={unsendMessage}
              onBack={() => setSelectedUser(null)}
              onGroupProfileClick={() => setIsGroupProfileOpen(true)}
            />
          </div>
        </div>
      </div>

      <ProfileDrawer
        isOpen={isProfileOpen}
        currentUser={{
          username: currentUser.username,
          name: currentUser.name,
          email: currentUser.email,
          dp: currentUser.dp,
        }}
        profileName={profileName}
        profileDp={profileDp}
        profileCurrentPassword={profileCurrentPassword}
        profileNewPassword={profileNewPassword}
        isUpdating={isUpdating}
        updateError={profileUpdateError}
        onClose={closeProfile}
        onNameChange={setProfileName}
        onDpChange={setProfileDp}
        onCurrentPasswordChange={setProfileCurrentPassword}
        onNewPasswordChange={setProfileNewPassword}
        onSave={handleProfileUpdate}
      />

      <GroupProfileDrawer
        isOpen={isGroupProfileOpen}
        group={selectedUser?.isGroup ? selectedUser : null}
        currentUser={currentUser}
        onClose={() => setIsGroupProfileOpen(false)}
        onGroupUpdated={async () => {
          await fetchRecentChats();
        }}
        onExitGroup={async () => {
          setSelectedUser(null);
          setMessages([]);
          setIsGroupProfileOpen(false);
          await fetchRecentChats();
        }}
      />

      <CallModal
        receivingCall={receivingCall}
        caller={caller}
        watchTogetherSession={watchTogetherSession}
        onAnswerCall={answerCall}
        onAnswerWatchTogether={answerWatchTogether}
        onEndCall={endCall}
      />

      <ActiveCallUI
        callAccepted={callAccepted}
        callEnded={callEnded}
        calling={calling}
        onEndCall={endCall}
      />

      <WatchTogetherOverlay
        isWatchTogether={isWatchTogether}
        isWatchTogetherAdmin={isWatchTogetherAdmin}
        watchTogetherParticipants={watchTogetherParticipants}
        isScreenSharing={isScreenSharing}
        screenStream={screenStream}
        mutedParticipants={mutedParticipants}
        currentUser={currentUser}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onEndWatchTogether={endWatchTogether}
        onStartScreenShare={startScreenShare}
        onToggleSelfMute={toggleSelfMute}
        onAddParticipant={addParticipantToWatchTogether}
        onRemoveParticipant={removeParticipantFromWatchTogether}
        onToggleParticipantMute={toggleParticipantMute}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
}