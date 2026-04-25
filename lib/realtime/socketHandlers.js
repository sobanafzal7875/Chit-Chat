/**
 * Socket.IO event wiring (plain JS so `server.js` can import without a TS build step).
 * Keeps transport concerns out of `server.js` for easier changes and testing.
 */

export function registerSocketHandlers(io) {
  /** @type {Map<string, { admin: string, participants: string[] }>} */
  const watchSessions = new Map();

  io.on('connection', (socket) => {
    socket.on('join', (username) => {
      if (typeof username === 'string' && username) {
        socket.join(username);
      }
    });

    socket.on('join_group', (groupId) => {
      if (groupId) socket.join(String(groupId));
    });

    socket.on('leave_group', (groupId) => {
      if (groupId) socket.leave(String(groupId));
    });

    socket.on('send_message', (message) => {
      if (!message || typeof message !== 'object') return;
      if (message.groupId) {
        io.to(String(message.groupId)).emit('receive_message', message);
      } else if (message.receiver) {
        io.to(message.receiver).emit('receive_message', message);
      }
    });

    socket.on('mark_read', ({ sender, receiver }) => {
      if (sender && receiver) {
        io.to(sender).emit('messages_read', { by: receiver });
      }
    });

    socket.on('call_user', ({ userToCall, signalData, from, name }) => {
      if (userToCall) {
        io.to(userToCall).emit('call_incoming', {
          signal: signalData,
          from,
          name,
        });
      }
    });

    socket.on('answer_call', ({ to, signal }) => {
      if (to) io.to(to).emit('call_accepted', signal);
    });

    socket.on('end_call', ({ to }) => {
      if (to) io.to(to).emit('call_ended');
    });

    socket.on('start_watch_together', ({ sessionId, admin, participants, to }) => {
      if (!sessionId || !to) return;
      const list = [admin, ...(Array.isArray(participants) ? participants : [])].filter(
        Boolean
      );
      watchSessions.set(sessionId, { admin, participants: [...new Set(list)] });
      socket.join(`wt:${sessionId}`);
      io.to(to).emit('watch_together_invitation', {
        sessionId,
        admin,
        participants: list,
        from: admin,
      });
    });

    socket.on('join_watch_together', ({ sessionId, participant }) => {
      if (!sessionId || !participant) return;
      socket.join(`wt:${sessionId}`);
      let session = watchSessions.get(sessionId);
      if (!session) {
        session = { admin: participant, participants: [participant] };
        watchSessions.set(sessionId, session);
      }
      if (!session.participants.includes(participant)) {
        session.participants.push(participant);
      }
      const participantData = session.participants.map((u) => ({
        username: u,
        name: u,
        isAdmin: u === session.admin,
      }));
      io.to(`wt:${sessionId}`).emit('watch_together_started', {
        sessionId,
        admin: session.admin,
        participants: session.participants,
        participantData,
      });
    });

    socket.on('end_watch_together', ({ sessionId }) => {
      if (!sessionId) return;
      io.to(`wt:${sessionId}`).emit('watch_together_ended', { sessionId });
      watchSessions.delete(sessionId);
    });

    socket.on('add_participant_watch_together', ({ sessionId, participant }) => {
      const session = watchSessions.get(sessionId);
      if (!session || !participant) return;
      if (!session.participants.includes(participant)) {
        session.participants.push(participant);
      }
      const participantData = {
        username: participant,
        name: participant,
        isAdmin: participant === session.admin,
      };
      io.to(`wt:${sessionId}`).emit('participant_added_watch_together', {
        participant,
        participantData,
      });
      io.to(participant).emit('watch_together_invitation', {
        sessionId,
        admin: session.admin,
        participants: session.participants,
        from: session.admin,
      });
    });

    socket.on('remove_participant_watch_together', ({ sessionId, participant }) => {
      if (!sessionId || !participant) return;
      const session = watchSessions.get(sessionId);
      if (session) {
        session.participants = session.participants.filter((p) => p !== participant);
      }
      io.to(`wt:${sessionId}`).emit('participant_removed_watch_together', {
        participant,
      });
    });

    socket.on('toggle_mute_watch_together', ({ sessionId, participant, muted }) => {
      if (!sessionId || !participant) return;
      io.to(`wt:${sessionId}`).emit('participant_muted_watch_together', {
        participant,
        muted: Boolean(muted),
      });
    });

    // socket.on('screen_share_started', ({ sessionId }) => {
    //   if (sessionId) socket.to(`wt:${sessionId}`).emit('screen_share_started', { sessionId });
    // });

    // socket.on('screen_share_ended', ({ sessionId }) => {
    //   if (sessionId) socket.to(`wt:${sessionId}`).emit('screen_share_ended', { sessionId });
    // });
      socket.on('screen_share_signal', ({ sessionId, signal, to }) => {
    if (to) io.to(to).emit('screen_share_signal', { signal, from: socket.id });
  });

  socket.on('screen_share_started', ({ sessionId }) => {
  if (sessionId) {
    socket.to(`wt:${sessionId}`).emit('screen_share_started', { sessionId });
    socket.to(`wt:${sessionId}`).emit('screen_share_incoming', { sessionId });
  }
});

  socket.on('screen_share_ended', ({ sessionId }) => {
    if (sessionId) socket.to(`wt:${sessionId}`).emit('screen_share_ended', { sessionId });
  });
  });
}
