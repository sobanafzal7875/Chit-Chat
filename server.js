import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room based on their own username to receive messages
    socket.on('join', (username) => {
      socket.join(username);
      console.log(`User ${username} joined their personal room`);
    });

    // Handle sending a private message
    socket.on('private_message', ({ sender, receiver, message, fileUrl, fileType }) => {
      console.log(`Message from ${sender} to ${receiver}`);
      io.to(receiver).emit('receive_message', {
        sender,
        message,
        fileUrl,
        fileType,
        timestamp: new Date().toISOString()
      });
    });

    // Handle group messages
    socket.on('group_message', ({ sender, groupId, message, fileUrl, fileType }) => {
      console.log(`Group message in ${groupId} from ${sender}`);
      socket.to(groupId).emit('receive_message', {
        sender,
        groupId,
        message,
        fileUrl,
        fileType,
        timestamp: new Date().toISOString()
      });
    });

    // Handle read receipts
    socket.on('mark_read', ({ sender, receiver }) => {
      // Receiver has read messages from Sender
      io.to(sender).emit('messages_read', { by: receiver });
    });

    // --- WebRTC Audio Call Signaling ---
    socket.on('call_user', ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit('call_incoming', { signal: signalData, from, name });
    });

    socket.on('answer_call', ({ to, signal }) => {
      io.to(to).emit('call_accepted', signal);
    });

    socket.on('end_call', ({ to }) => {
      io.to(to).emit('call_ended');
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
