'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { authHeaders, getBearerToken, jsonAuthHeaders } from '@/lib/client/authFetch';
import type { ChatListItem, ChatMessage, ChatUser } from '@/types/chat';

type PeerSignalArg = Parameters<InstanceType<typeof Peer>['signal']>[0];

function senderUsername(sender: ChatMessage['sender']): string {
  if (typeof sender === 'object' && sender !== null && 'username' in sender) {
    return sender.username;
  }
  return String(sender);
}

function normalizeSearchUsers(
  users: { _id?: string; username: string; name: string; dp?: string }[],
  excludeUsername?: string
): ChatUser[] {
  return users
    .filter((u) => !excludeUsername || u.username !== excludeUsername)
    .map((u) => ({
      id: String(u._id ?? ''),
      username: u.username,
      name: u.name,
      dp: u.dp,
    }));
}

export function useChat() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const currentUserRef = useRef<ChatUser | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const selectedUserRef = useRef<ChatUser | null>(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [fileAttachment, setFileAttachment] = useState<{ url: string; type: string } | null>(
    null
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDp, setProfileDp] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isGroupProfileOpen, setIsGroupProfileOpen] = useState(false);
  const [isGroupCreationMode, setIsGroupCreationMode] = useState(false);
  const [groupCreationStep, setGroupCreationStep] = useState<'select' | 'name'>('select');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState<unknown>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [calling, setCalling] = useState(false);
  const callRemoteUsernameRef = useRef<string | null>(null);
  const myAudio = useRef<HTMLAudioElement>(null);
  const userAudio = useRef<HTMLAudioElement>(null);
  const connectionRef = useRef<InstanceType<typeof Peer> | null>(null);
  const screenPeerRef = useRef<InstanceType<typeof Peer> | null>(null);

  const [isWatchTogether, setIsWatchTogether] = useState(false);
  const [watchTogetherSession, setWatchTogetherSession] = useState<{ id: string; admin?: string; participants?: string[] } | null>(null);
  const [watchTogetherParticipants, setWatchTogetherParticipants] = useState<
    { username: string; name: string; isAdmin?: boolean }[]
  >([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isWatchTogetherAdmin, setIsWatchTogetherAdmin] = useState(false);
  const [mutedParticipants, setMutedParticipants] = useState<Set<string>>(new Set());

  async function fetchRecentChats() {
  try {
    // Pehle cached data dikhao — user ko turant sidebar dikhe
    const cached = localStorage.getItem('chats_cache');
    if (cached) {
      setChats(JSON.parse(cached));
    }
    // Background mein fresh data fetch karo
    const res = await fetch('/api/chats', { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      const chats = data.chats || [];
      localStorage.setItem('chats_cache', JSON.stringify(chats));
      setChats(chats);
    }
  } catch (e) {
    console.error('Error fetching chats:', e);
  }
}

  const resetWatchTogetherLocal = useCallback(() => {
    setIsWatchTogether(false);
    setWatchTogetherSession(null);
    setWatchTogetherParticipants([]);
    setIsWatchTogetherAdmin(false);
    setIsScreenSharing(false);
    setMutedParticipants(new Set());
    setScreenStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  useEffect(() => {
    const token = getBearerToken();
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    if (!token || !username) {
      router.push('/');
      return;
    }

    void (async () => {
      try {
      const [res] = await Promise.all([
        fetch('/api/users/profile', { headers: authHeaders() }),
        fetchRecentChats(), // ← dono SAATH mein chalein
      ]);
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setProfileName(data.user.name);
        setProfileDp(data.user.dp || '');
      }
        else {
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    })();

    const newSocket = io();
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      newSocket.emit('join', username);
    });

    newSocket.on('receive_message', (msg: ChatMessage) => {
      const senderStr = senderUsername(msg.sender);
      if (senderStr === username) return;
      const sel = selectedUserRef.current;
      const inThread =
        (msg.groupId && sel?.isGroup && sel.id === String(msg.groupId)) ||
        (!msg.groupId && !sel?.isGroup && sel?.username === senderStr);
      if (!inThread) return;

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m._id === msg._id ||
            (m.createdAt === msg.createdAt && senderUsername(m.sender) === senderStr)
        );
        if (exists) return prev;
        return [...prev, msg];
      });

      if (!msg.groupId) {
        newSocket.emit('mark_read', { sender: senderStr, receiver: username });
        void fetch('/api/messages/read', {
          method: 'POST',
          headers: jsonAuthHeaders(),
          body: JSON.stringify({ otherUsername: senderStr }),
        });
      }
      // Sidebar unread count update karo
      void fetchRecentChats(); 
    });

    newSocket.on('messages_read', ({ by }: { by: string }) => {
      const sel = selectedUserRef.current;
      const me = currentUserRef.current?.username;
      if (sel && !sel.isGroup && sel.username === by && me) {
        setMessages((prev) =>
          prev.map((m) =>
            !m.read && senderUsername(m.sender) === me ? { ...m, read: true } : m
          )
        );
      }
    });

    newSocket.on('message_unsent', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, unsent: true, content: '', fileUrl: undefined, fileType: undefined }
            : m
        )
      );
      // void fetchRecentChats();
    });

    newSocket.on(
      'chat_deleted',
      (payload: { kind: 'dm' | 'group'; peerUsername?: string; groupId?: string }) => {
        void fetchRecentChats();
        const sel = selectedUserRef.current;
        if (
          payload.kind === 'dm' &&
          sel &&
          !sel.isGroup &&
          payload.peerUsername &&
          sel.username === payload.peerUsername
        ) {
          setSelectedUser(null);
          setMessages([]);
        }
        if (
          payload.kind === 'group' &&
          sel?.isGroup &&
          payload.groupId &&
          sel.id === payload.groupId
        ) {
          setSelectedUser(null);
          setMessages([]);
        }
      }
    );

    newSocket.on('group_updated', (group: any) => {
      void fetchRecentChats();
      const sel = selectedUserRef.current;
      if (sel?.isGroup && sel.id === group._id) {
        setSelectedUser((prev: any) => prev ? {
          ...prev,
          name: group.name,
          dp: group.dp,
          members: group.members,
          admin: group.admin,
        } : prev);
      }
    });

    newSocket.on('chat_added', () => {
      void fetchRecentChats();
    });

    newSocket.on('call_incoming', ({ signal, from }: { signal: unknown; from: string }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
    });

    newSocket.on('call_accepted', (signal: PeerSignalArg) => {
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
      connectionRef.current?.destroy();
      connectionRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      callRemoteUsernameRef.current = null;
    });

    newSocket.on(
      'watch_together_invitation',
      ({
        sessionId,
        admin,
        participants,
        from,
      }: {
        sessionId: string;
        admin: string;
        participants: string[];
        from: string;
      }) => {
        setReceivingCall(true);
        setCaller(from);
        setWatchTogetherSession({ id: sessionId, admin, participants });
      }
    );

    newSocket.on(
      'watch_together_started',
      ({
        sessionId,
        admin,
        participants,
        participantData,
      }: {
        sessionId: string;
        admin: string;
        participants: string[];
        participantData: typeof watchTogetherParticipants;
      }) => {
        setIsWatchTogether(true);
        setWatchTogetherSession({ id: sessionId, admin, participants });
        setWatchTogetherParticipants(participantData || []);
        setIsWatchTogetherAdmin(admin === currentUserRef.current?.username);
      }
    );

    newSocket.on(
      'participant_added_watch_together',
      ({ participant, participantData }: { participant: string; participantData: (typeof watchTogetherParticipants)[0] }) => {
        setWatchTogetherParticipants((prev) => [...prev, participantData]);
        setWatchTogetherSession((prev) =>
          prev
            ? {
                ...prev,
                participants: [...(prev.participants || []), participant],
              }
            : prev
        );
      }
    );

    newSocket.on('participant_removed_watch_together', ({ participant }: { participant: string }) => {
      setWatchTogetherParticipants((prev) => prev.filter((p) => p.username !== participant));
      setWatchTogetherSession((prev) =>
        prev
          ? {
              ...prev,
              participants: (prev.participants || []).filter((p) => p !== participant),
            }
          : prev
      );
      if (participant === currentUserRef.current?.username) {
        resetWatchTogetherLocal();
      }
    });

    newSocket.on('participant_muted_watch_together', ({ participant, muted }: { participant: string; muted: boolean }) => {
      setMutedParticipants((prev) => {
        const next = new Set(prev);
        if (muted) next.add(participant);
        else next.delete(participant);
        return next;
      });
    });

    newSocket.on('watch_together_ended', () => {
      resetWatchTogetherLocal();
    });
      newSocket.on('screen_share_started', ({ sessionId }: { sessionId: string }) => {
  if (watchTogetherSession?.id === sessionId) {
    setIsScreenSharing(true);
  }
});

newSocket.on('screen_share_ended', ({ sessionId }: { sessionId: string }) => {
  if (watchTogetherSession?.id === sessionId) {
    setIsScreenSharing(false);
    setScreenStream(null);
  }
});

newSocket.on('screen_share_signal', ({ signal }: { signal: unknown }) => {
  screenPeerRef.current?.signal(signal as PeerSignalArg);
});


    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [resetWatchTogetherLocal, router]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const me = currentUserRef.current?.username;
        setSearchResults(normalizeSearchUsers(data.users || [], me));
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isGroupCreationMode) return;
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      void searchUsers(q);
    }, 280);
    return () => clearTimeout(t);
  }, [searchQuery, isGroupCreationMode, searchUsers]);

  const selectUser = async (user: ChatListItem | ChatUser) => {
    const isGroup = Boolean(user.isGroup);
    const id = user.id ?? '';
    const username = user.username ?? '';
    if (!isGroup && !username) return;

    const normalized: ChatUser = {
      id,
      username,
      name: user.name,
      dp: user.dp,
      email: (user as ChatUser).email,
      isGroup,
      members: (user as ChatUser).members,
      admin: (user as ChatListItem).admin,
    };
    setSelectedUser(normalized);
    setSearchQuery('');
    const me = currentUserRef.current?.username;
    if (!me) return;

    if (normalized.isGroup) {
      socketRef.current?.emit('join_group', normalized.id);
    }

    try {
      const endpoint = normalized.isGroup
        ? `/api/messages?groupId=${normalized.id}`
        : `/api/messages?with=${encodeURIComponent(normalized.username)}`;
      const res = await fetch(endpoint, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);

        if (!normalized.isGroup && me) {
    socketRef.current?.emit('mark_read', {
      sender: normalized.username,
      receiver: me,
    });
    void fetch('/api/messages/read', {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ otherUsername: normalized.username }),
    });
  }   
  // Group messages bhi read mark karo
      if (normalized.isGroup) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === normalized.id ? { ...c, unreadCount: 0 } : c
          )
        );
      }
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  

  const sendMessage = async () => {
    const sel = selectedUserRef.current;
    const me = currentUserRef.current;
    if ((!newMessage.trim() && !fileAttachment) || !sel || !me) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          content: newMessage,
          receiver: sel.isGroup ? undefined : sel.username,
          groupId: sel.isGroup ? sel.id : undefined,
          fileUrl: fileAttachment?.url,
          fileType: fileAttachment?.type,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        const savedMessage = saved.message as ChatMessage;
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage('');
        setFileAttachment(null);
        // await fetchRecentChats();
        setChats((prev) => {
        const chatId = sel.isGroup ? sel.id : sel.username;
        const exists = prev.find((c) => (sel.isGroup ? c.id === chatId : c.username === chatId));
        if (exists) {
          return [
            { ...exists, lastMessage: savedMessage, unreadCount: 0 },
            ...prev.filter((c) => c !== exists),
          ];
        }
        return prev;
      });
        socketRef.current?.emit('send_message', savedMessage);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const handleFileAttach = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFileAttachment({
        url: reader.result as string,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    const me = currentUserRef.current;
    if (!me || !profileName.trim()) return;
    setProfileUpdateError('');
    if (profileNewPassword.trim() && !profileCurrentPassword) {
      setProfileUpdateError('Enter your current password to set a new password.');
      return;
    }
    setIsUpdating(true);
    try {
      const body: Record<string, string> = {
        name: profileName.trim(),
        dp: profileDp,
      };
      if (profileNewPassword.trim()) {
        body.currentPassword = profileCurrentPassword;
        body.newPassword = profileNewPassword;
      }
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                name: data.user.name,
                dp: data.user.dp ?? '',
                email: data.user.email ?? prev.email,
              }
            : prev
        );
        setProfileCurrentPassword('');
        setProfileNewPassword('');
        setIsProfileOpen(false);
      } else {
        setProfileUpdateError(data.error || 'Could not update profile.');
      }
    } catch (e) {
      console.error('Error updating profile:', e);
      setProfileUpdateError('Something went wrong. Try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    setProfileUpdateError('');
    setProfileCurrentPassword('');
    setProfileNewPassword('');
  };

  const openProfile = () => {
    setProfileUpdateError('');
    setProfileCurrentPassword('');
    setProfileNewPassword('');
    setIsProfileOpen(true);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const startGroupCreation = async () => {
    setIsGroupCreationMode(true);
    setGroupCreationStep('select');
    setSelectedMembers([]);
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    try {
      const res = await fetch('/api/users/search?q=', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const me = currentUserRef.current?.username;
        setSearchResults(normalizeSearchUsers(data.users || [], me));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createGroup = async () => {
  const me = currentUserRef.current;
  if (!groupName || selectedMembers.length === 0 || !me) return;
  try {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({
        name: groupName,
        members: selectedMembers,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsGroupCreationMode(false);
      setGroupCreationStep('select');
      setGroupName('');
      setSelectedMembers([]);
      setSearchQuery('');
      await fetchRecentChats();

      // ✅ Group create hone ke baad automatically open karo
      if (data.group) {
        const newGroup: ChatUser = {
          id: String(data.group._id),
          username: '',
          name: data.group.name,
          dp: data.group.dp,
          isGroup: true,
          members: data.group.members,
          admin: data.group.admin,
        };
        setSelectedUser(newGroup);
        // Messages fetch karo
        try {
          const msgRes = await fetch(`/api/messages?groupId=${data.group._id}`, {
            headers: authHeaders(),
          });
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            setMessages(msgData.messages || []);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

  // const createGroup = async () => {
  //   const me = currentUserRef.current;
  //   if (!groupName || selectedMembers.length === 0 || !me) return;
  //   try {
  //     const res = await fetch('/api/groups', {
  //       method: 'POST',
  //       headers: jsonAuthHeaders(),
  //       body: JSON.stringify({
  //         name: groupName,
  //         members: selectedMembers,
  //       }),
  //     });
  //     if (res.ok) {
  //       setIsGroupCreationMode(false);
  //       setGroupCreationStep('select');
  //       setGroupName('');
  //       setSelectedMembers([]);
  //       setSearchQuery('');
  //       await fetchRecentChats();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const callUser = (user: ChatUser) => {
  //   const me = currentUserRef.current;
  //   const sock = socketRef.current;
  //   if (!me || !sock) return;
  //   callRemoteUsernameRef.current = user.username;

  //   void navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((mediaStream) => {
  //     setStream(mediaStream);
  //     setCalling(true);

  //     const peer = new Peer({
  //       initiator: true,
  //       trickle: false,
  //       stream: mediaStream,
  //     });

  //     peer.on('signal', (data) => {
  //       sock.emit('call_user', {
  //         userToCall: user.username,
  //         signalData: data,
  //         from: me.username,
  //         name: me.name,
  //       });
  //     });

  //     peer.on('stream', (remoteStream) => {
  //       if (userAudio.current) userAudio.current.srcObject = remoteStream;
  //     });

  //     const onAccepted = (signal: PeerSignalArg) => {
  //       setCallAccepted(true);
  //       setCalling(false);
  //       peer.signal(signal);
  //       sock.off('call_accepted', onAccepted);
  //     };
  //     sock.on('call_accepted', onAccepted);

  //     connectionRef.current = peer;
  //   });
  // };

  const callUser = (user: ChatUser) => {
  const me = currentUserRef.current;
  const sock = socketRef.current;
  if (!me || !sock) return;
  callRemoteUsernameRef.current = user.username;

  void navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((mediaStream) => {
    setStream(mediaStream);
    setCalling(true);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: mediaStream,
    });

    peer.on('signal', (data) => {
      sock.emit('call_user', {
        userToCall: user.username,
        signalData: data,
        from: me.username,
        name: me.name,
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userAudio.current) userAudio.current.srcObject = remoteStream;
    });

    connectionRef.current = peer;
  });
};

  const answerCall = () => {
    const sock = socketRef.current;
    if (!sock) return;
    setCallAccepted(true);
    setReceivingCall(false);

    void navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((mediaStream) => {
      setStream(mediaStream);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
      });

      peer.on('signal', (data) => {
        sock.emit('answer_call', { signal: data, to: caller });
      });

      peer.on('stream', (remoteStream) => {
        if (userAudio.current) userAudio.current.srcObject = remoteStream;
      });

      peer.signal(callerSignal as PeerSignalArg);
      connectionRef.current = peer;
    });
  };

  const endCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    setCalling(false);
    connectionRef.current?.destroy();
    connectionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const to = callRemoteUsernameRef.current || caller;
    if (to) socketRef.current?.emit('end_call', { to });
    callRemoteUsernameRef.current = null;
  };

  const startWatchTogether = async (user: ChatUser) => {
    const me = currentUserRef.current;
    const sock = socketRef.current;
    if (!me || !sock) return;

    try {
      const res = await fetch('/api/watch-together/start', {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          participants: [user.username],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWatchTogetherSession(data.session);
        setIsWatchTogether(true);
        setIsWatchTogetherAdmin(true);
        setWatchTogetherParticipants(data.participants || []);
        sock.emit('start_watch_together', {
          sessionId: data.session.id,
          admin: me.username,
          participants: [user.username],
          to: user.username,
        });
      }
    } catch (e) {
      console.error('Error starting watch together:', e);
    }
  };

  const answerWatchTogether = () => {
    const sock = socketRef.current;
    if (!sock || !watchTogetherSession) return;
    setCallAccepted(true);
    setReceivingCall(false);
    setIsWatchTogether(true);
    setIsWatchTogetherAdmin(false);
    const me = currentUserRef.current?.username;
    if (me) {
      sock.emit('join_watch_together', {
        sessionId: watchTogetherSession.id,
        participant: me,
      });
    }
  };

  const endWatchTogether = () => {
    const sid = watchTogetherSession?.id;
    resetWatchTogetherLocal();
    if (sid) socketRef.current?.emit('end_watch_together', { sessionId: sid });
  };

  const startScreenShare = async () => {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setScreenStream(display);
      setIsScreenSharing(true);

      display.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setScreenStream(null);
        const sid = watchTogetherSession?.id;
        if (sid) socketRef.current?.emit('screen_share_ended', { sessionId: sid });
      };

      const sid = watchTogetherSession?.id;
      if (sid) {
        socketRef.current?.emit('screen_share_started', {
          sessionId: sid,
          stream: display.id,
        });
      }
    } catch (e) {
      console.error('Error starting screen share:', e);
    }
  };

  const addParticipantToWatchTogether = (uname: string) => {
    const sid = watchTogetherSession?.id;
    if (sid) {
      socketRef.current?.emit('add_participant_watch_together', { sessionId: sid, participant: uname });
    }
  };

  const removeParticipantFromWatchTogether = (uname: string) => {
    const sid = watchTogetherSession?.id;
    if (sid) {
      socketRef.current?.emit('remove_participant_watch_together', { sessionId: sid, participant: uname });
    }
  };

  const toggleParticipantMute = (uname: string) => {
    const sid = watchTogetherSession?.id;
    if (!sid) return;
    const isMuted = mutedParticipants.has(uname);
    setMutedParticipants((prev) => {
      const next = new Set(prev);
      if (isMuted) next.delete(uname);
      else next.add(uname);
      return next;
    });
    socketRef.current?.emit('toggle_mute_watch_together', {
      sessionId: sid,
      participant: uname,
      muted: !isMuted,
    });
  };

  const toggleSelfMute = () => {
    const me = currentUserRef.current?.username;
    if (me) toggleParticipantMute(me);
  };

  const deleteChat = async (chat: ChatListItem) => {
    const label = chat.name || chat.username || 'this chat';
    if (
      !window.confirm(
        `Delete "${label}"? All messages in this chat will be removed for everyone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/chats', {
        method: 'DELETE',
        headers: jsonAuthHeaders(),
        body: JSON.stringify(
          chat.isGroup ? { groupId: chat.id } : { with: chat.username }
        ),
      });
      if (res.ok) {
        const sel = selectedUserRef.current;
        if (
          sel &&
          (sel.id === chat.id ||
            (!chat.isGroup && sel.username === chat.username))
        ) {
          setSelectedUser(null);
          setMessages([]);
        }
        await fetchRecentChats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unsendMessage = async (messageId: string) => {
    if (!window.confirm('Remove this message for everyone in this chat?')) return;
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, unsent: true, content: '', fileUrl: undefined, fileType: undefined }
              : m
          )
        );
        // await fetchRecentChats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
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
    screenStream,
    myAudio,
    userAudio,
    setSearchQuery,
    setSearchResults,
    searchUsers,
    selectUser,
    setNewMessage,
    sendMessage,
    handleFileAttach,
    setFileAttachment,
    setIsProfileOpen,
    setProfileName,
    setProfileDp,
    profileCurrentPassword,
    setProfileCurrentPassword,
    profileNewPassword,
    setProfileNewPassword,
    profileUpdateError,
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
    setSelectedUser, // ✅ ADD
    isGroupProfileOpen,
    setIsGroupProfileOpen,
    fetchRecentChats,
    setMessages,
  };
}
