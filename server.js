const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    rooms.get(roomId).add(user.id);
    
    socket.to(roomId).emit('userJoined', user);
    
    // Send current room state to the new user
    const roomUsers = Array.from(rooms.get(roomId)).map((userId) => ({
      id: userId,
      name: userId === user.id ? user.name : `User ${userId.slice(0, 4)}`,
    }));
    
    socket.emit('roomState', { users: roomUsers });
  });

  socket.on('leaveRoom', ({ roomId, userId }) => {
    socket.leave(roomId);
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        socket.to(roomId).emit('userLeft', userId);
      }
    }
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    socket.to(roomId).emit('newMessage', message);
  });

  socket.on('updateProgress', ({ roomId, progress }) => {
    socket.to(roomId).emit('videoProgress', progress);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up rooms when user disconnects
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('userLeft', socket.id);
        
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 