require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store active rooms and their users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    rooms.get(roomId).add(user);
    socket.to(roomId).emit('userJoined', user);
    
    // Send current users in room to the new user
    const usersInRoom = Array.from(rooms.get(roomId));
    socket.emit('roomUsers', usersInRoom);
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    io.to(roomId).emit('newMessage', message);
  });

  socket.on('updateProgress', ({ roomId, progress }) => {
    socket.to(roomId).emit('videoProgress', progress);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    rooms.forEach((users, roomId) => {
      const user = Array.from(users).find(u => u.id === socket.id);
      if (user) {
        users.delete(user);
        io.to(roomId).emit('userLeft', socket.id);
        
        // If room is empty, delete it
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