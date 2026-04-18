'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Peer from 'simple-peer';

export default function ChatHome() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Chats & Sidebar
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const selectedUserRef = useRef<any | null>(null);
  
  // Messaging
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileAttachment, setFileAttachment] = useState<{ url: string, type: string } | null>(null);

  // Profile Update State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDp, setProfileDp] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Group Create State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Calling State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [calling, setCalling] = useState(false);
  const myAudio = useRef<HTMLAudioElement>(null);
  const userAudio = useRef<HTMLAudioElement>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token || !username) {
      router.push('/');
      return;
    }

    fetch(`/api/users/profile?username=${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setProfileName(data.user.name);
          setProfileDp(data.user.dp || '');
          fetchRecentChats(data.user.username);
        }
      });

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', username);
    });

    // Real-time messages
    newSocket.on('receive_message', (msg) => {
      // Ignore messages that originated from the current user to prevent duplicate self-notifications
      if (msg.sender === username) return;

      // Refresh chat list to update order and unread counts
      fetchRecentChats(username);

      if (
        (msg.groupId && selectedUserRef.current?.isGroup && selectedUserRef.current?.id === msg.groupId) ||
        (!msg.groupId && !selectedUserRef.current?.isGroup && selectedUserRef.current?.username === msg.sender)
      ) {
        setMessages((prev) => [...prev, msg]);
        // Mark as read immediately if we are viewing the chat
        if (!msg.groupId) {
          newSocket.emit('mark_read', { sender: msg.sender, receiver: username });
          fetch('/api/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: msg.sender, receiver: username })
          });
        }
      }
    });

    // Handle read receipts
    newSocket.on('messages_read', ({ by }) => {
      if (selectedUserRef.current && selectedUserRef.current.username === by) {
        setMessages((prev) => prev.map(m => (!m.read && m.sender === username ? { ...m, read: true } : m)));
      }
    });

    // WebRTC Calls
    newSocket.on('call_incoming', ({ signal, from, name }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
    });

    newSocket.on('call_accepted', (signal) => {
      setCallAccepted(true);
      setCalling(false);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    newSocket.on('call_ended', () => {
      setCallEnded(true);
      setCallAccepted(false);
      setReceivingCall(false);
      if (connectionRef.current) connectionRef.current.destroy();
      if (stream) stream.getTracks().forEach(track => track.stop());
    });

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  const fetchRecentChats = async (uname: string) => {
    try {
      const res = await fetch(`/api/chats?username=${uname}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
        // Also emit join for all groups so socket receives group messages
        data.chats.forEach((c: any) => {
           if (c.isGroup && socket) socket.emit('join', c.id);
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    if (selectedUser && currentUser) {
      setMessages([]);
      // Determine if group or direct
      if (selectedUser.isGroup) {
         // Need a group messages API, falling back to direct messages logic modified for groups
         fetch(`/api/messages?groupId=${selectedUser.id}`) // Assuming API is updated for this or we just use same endpoint differently
          .then(res => res.json())
          .then(data => {
            if (data.messages) setMessages(data.messages);
          });
      } else {
        fetch(`/api/messages?user1=${currentUser.username}&user2=${selectedUser.username}`)
          .then(res => res.json())
          .then(data => {
            if (data.messages) setMessages(data.messages);
            
            // Mark read
            if (socket) {
              socket.emit('mark_read', { sender: selectedUser.username, receiver: currentUser.username });
              fetch('/api/messages/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: selectedUser.username, receiver: currentUser.username })
              });
              fetchRecentChats(currentUser.username); // update badge
            }
          });
      }
    }
  }, [selectedUser, currentUser, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !fileAttachment) || !selectedUser || !currentUser || !socket) return;

    const messageData: any = {
      sender: currentUser.username,
      content: newMessage,
      fileUrl: fileAttachment?.url,
      fileType: fileAttachment?.type,
      read: false
    };

    if (selectedUser.isGroup) {
      messageData.groupId = selectedUser.id;
    } else {
      messageData.receiver = selectedUser.username;
    }

    const optimisticMsg = { ...messageData, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
    setFileAttachment(null);
    fetchRecentChats(currentUser.username); // bring to top

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (selectedUser.isGroup) {
        socket.emit('group_message', { ...messageData, message: newMessage });
      } else {
        socket.emit('private_message', { ...messageData, message: newMessage });
      }
    } catch (err) { console.error('Failed to send message', err); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileAttachment({ url: reader.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  // WebRTC Audio Call Logic
  const initiateCall = () => {
    if (!selectedUser || selectedUser.isGroup) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((currentStream) => {
      setStream(currentStream);
      setCalling(true);
      const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

      peer.on('signal', (data: any) => {
        socket?.emit('call_user', {
          userToCall: selectedUser.username,
          signalData: data,
          from: currentUser.username,
          name: currentUser.name
        });
      });

      peer.on('stream', (currentStream: any) => {
        if (userAudio.current) userAudio.current.srcObject = currentStream;
      });

      connectionRef.current = peer;
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((currentStream) => {
      setStream(currentStream);
      const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

      peer.on('signal', (data: any) => {
        socket?.emit('answer_call', { signal: data, to: caller });
      });

      peer.on('stream', (currentStream: any) => {
        if (userAudio.current) userAudio.current.srcObject = currentStream;
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    });
  };

  const endCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    setCalling(false);
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    socket?.emit('end_call', { to: caller || selectedUser?.username });
  };

  const createGroup = async () => {
    if (!groupName || selectedMembers.length === 0) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          admin: currentUser.username,
          members: selectedMembers
        })
      });
      if (res.ok) {
        setIsGroupModalOpen(false);
        fetchRecentChats(currentUser.username);
      }
    } catch (e) { console.error(e); }
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users.filter((u: any) => u.username !== currentUser?.username));
      }
    } finally { setIsSearching(false); }
  };

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <audio ref={myAudio} autoPlay muted className="hidden" />
      <audio ref={userAudio} autoPlay className="hidden" />

      {/* Incoming Call Modal */}
      {receivingCall && !callAccepted && (
        <div className="fixed top-10 right-10 z-50 bg-card p-6 rounded-xl shadow-2xl border border-border flex flex-col items-center animate-bounce">
          <h3 className="font-bold text-lg mb-2">Incoming Call...</h3>
          <p className="text-muted-foreground mb-4">@{caller} is calling you</p>
          <div className="flex gap-4">
            <Button onClick={answerCall} className="bg-green-600 hover:bg-green-700">Accept</Button>
            <Button onClick={endCall} variant="destructive">Decline</Button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {(callAccepted && !callEnded) || calling ? (
         <div className="fixed top-0 left-0 right-0 z-40 bg-green-900/90 text-white p-3 flex justify-between items-center px-10 shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-semibold">{calling ? 'Calling...' : 'Active Audio Call'}</span>
            </div>
            <Button onClick={endCall} variant="destructive" size="sm" className="rounded-full">End Call</Button>
         </div>
      ) : null}

      {/* Navbar */}
      <nav className="border-b border-border bg-card px-6 py-4 flex justify-between items-center z-10 shadow-sm mt-[env(safe-area-inset-top)]">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Chit<span className="text-primary">Chat</span>
        </h1>
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden cursor-pointer" onClick={() => setIsProfileOpen(true)}>
             {currentUser.dp ? <img src={currentUser.dp} className="w-full h-full object-cover"/> : currentUser.name.charAt(0).toUpperCase()}
           </div>
           <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); router.push('/'); }}>Logout</Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden h-[calc(100vh-80px)] min-h-0">
        
        {/* Sidebar */}
        <div className="md:col-span-1 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full relative min-h-0">
          <div className="p-3 border-b border-border/50">
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => searchUsers(e.target.value)}
              className="bg-background text-sm"
            />
          </div>
          <div className="flex-1 relative overflow-y-auto p-2">
            {searchQuery ? (
               <ul className="space-y-1">
                 {searchResults.map(u => (
                   <li key={u._id} onClick={() => { setSelectedUser(u); setSearchQuery(''); }} className="p-2 hover:bg-muted rounded-lg cursor-pointer flex gap-3 items-center">
                     <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden shrink-0">
                       {u.dp ? <img src={u.dp} className="w-full h-full object-cover"/> : u.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div className="font-semibold text-sm">{u.name}</div>
                       <div className="text-xs opacity-70">@{u.username}</div>
                     </div>
                   </li>
                 ))}
               </ul>
            ) : (
               <ul className="space-y-1">
                 {chats.map(c => (
                   <li key={c.id} onClick={() => setSelectedUser(c)} className={`p-2 hover:bg-muted rounded-lg cursor-pointer flex gap-3 items-center ${selectedUser?.id === c.id || selectedUser?.username === c.username ? 'bg-primary/10' : ''}`}>
                     <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden shrink-0">
                       {c.dp ? <img src={c.dp} className="w-full h-full object-cover"/> : (c.name || c.username).charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="font-semibold text-sm flex justify-between">
                         <span className="truncate">{c.name || c.username}</span>
                         {c.unreadCount > 0 && (
                           <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">{c.unreadCount}</span>
                         )}
                       </div>
                       <div className="text-xs text-muted-foreground truncate opacity-80">
                         {c.lastMessage?.content || (c.lastMessage?.fileUrl ? '📷 Attachment' : 'No messages yet')}
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
          <Button onClick={() => setIsGroupModalOpen(true)} className="absolute bottom-4 right-4 z-10 bg-primary text-primary-foreground hover:bg-primary/90">
            + New Group
          </Button>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 bg-card rounded-xl border border-border/50 shadow-sm flex flex-col h-full relative min-h-0">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden">
                    {selectedUser.dp ? <img src={selectedUser.dp} className="w-full h-full object-cover"/> : (selectedUser.name || selectedUser.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedUser.name || selectedUser.username} {selectedUser.isGroup && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">Group</span>}</h3>
                  </div>
                </div>
                {!selectedUser.isGroup && (
                  <Button variant="ghost" size="icon" onClick={initiateCall} title="Audio Call">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </Button>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-grid-black/[0.02] min-h-0">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === currentUser.username;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {selectedUser.isGroup && !isMe && <span className="text-[10px] text-muted-foreground ml-1 mb-0.5">@{msg.sender}</span>}
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                        {msg.fileUrl && (
                          msg.fileType?.startsWith('image/') ? 
                            <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg mb-2 max-h-60 object-contain" /> :
                            <a href={msg.fileUrl} download="attachment" className="underline text-sm mb-2 block">📄 Download Attachment</a>
                        )}
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && !selectedUser.isGroup && (
                          <span className={`text-[10px] ${msg.read ? 'text-blue-500' : 'text-gray-400'}`}>✓✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              {/* File Preview */}
              {fileAttachment && (
                <div className="p-2 border-t border-border bg-muted/50 flex items-center gap-3">
                  {fileAttachment.type.startsWith('image/') ? 
                    <img src={fileAttachment.url} className="h-10 w-10 object-cover rounded" /> : 
                    <div className="h-10 w-10 bg-primary/20 flex items-center justify-center rounded text-xs">📄</div>
                  }
                  <span className="text-sm truncate">Attachment</span>
                  <Button variant="ghost" size="sm" onClick={() => setFileAttachment(null)}>✕</Button>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                <label className="cursor-pointer shrink-0 flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors">
                   <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                   <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
                <Button type="submit" disabled={!newMessage.trim() && !fileAttachment}>Send</Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-70">
               <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
               <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Create Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <div className="space-y-4">
               <Input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} />
               <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                 <p className="text-xs text-muted-foreground mb-2 font-semibold">Select Members (from existing users)</p>
                 {searchResults.length === 0 && <span className="text-xs">Type in main search bar first to populate users</span>}
                 {searchResults.map(u => (
                   <label key={u._id} className="flex items-center gap-2 p-1 hover:bg-muted rounded">
                     <input type="checkbox" checked={selectedMembers.includes(u.username)} onChange={(e) => {
                       if (e.target.checked) setSelectedMembers(p => [...p, u.username]);
                       else setSelectedMembers(p => p.filter(m => m !== u.username));
                     }} />
                     {u.name} (@{u.username})
                   </label>
                 ))}
               </div>
               <div className="flex justify-end gap-2 mt-4">
                 <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
                 <Button onClick={createGroup}>Create</Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
