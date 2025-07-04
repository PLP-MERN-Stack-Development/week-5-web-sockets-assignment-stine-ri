import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import User from '../models/User.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Handle joining rooms
    socket.on('join_room', async (roomId) => {
      socket.join(roomId);
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(50);
      socket.emit('load_messages', messages.reverse());
    });

    // Handle sending messages
    socket.on('send_message', async (messageData) => {
      try {
        const message = new Message({
          content: messageData.content,
          sender: socket.user._id,
          room: messageData.roomId
        });
        await message.save();
        
        io.to(messageData.roomId).emit('receive_message', 
          await Message.populate(message, {
            path: 'sender',
            select: 'username avatar'
          })
        );
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    // Handle typing indicator
    socket.on('typing', (roomId) => {
      socket.broadcast.to(roomId).emit('user_typing', {
        username: socket.user.username,
        roomId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

export default configureSocket;