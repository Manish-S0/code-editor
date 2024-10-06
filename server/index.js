const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');  // For temp file handling for code execution
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend origin
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

let rooms = {};  // To store room data

// When a client connects
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create room
  socket.on('create_room', ({ roomid, username }) => {
    console.log('Create Room Event:', { roomid, username });

    if (!username || !roomid) {
      console.log('Invalid username or roomid');
      return;
    }

    rooms[roomid] = {
      users: [{ id: socket.id, username }],
      code: '// Write your code here...',
      messages: [] // Store messages for this room
    };
    socket.join(roomid);

    io.to(socket.id).emit('room_created', roomid);
    io.to(roomid).emit('connected_users', rooms[roomid].users);
    console.log(`Room ${roomid} created by ${username}`);
  });

  
  // Join room event
  socket.on('join_room', ({ roomid, username }) => {
    console.log('Join Room Event:', { roomid, username });

    if (!roomid || !rooms[roomid]) {
        io.to(socket.id).emit('room_not_found', 'Room not found');
        return;
    }

    if (!username) {
        console.log('Invalid username');
        return;
    }
    const userExists = rooms[roomid].users.some(user => user.username === username);

    // Add user to room's users list
    if (!userExists) {
      // Add the user to the room only if they don't already exist
      rooms[roomid].users.push({ id: socket.id, username });
    }
    socket.join(roomid);

    

    // Send the current language to the newly joined user
    io.to(socket.id).emit('language_update', rooms[roomid].language);

    io.to(socket.id).emit('room_joined', roomid);
    io.to(roomid).emit('connected_users', rooms[roomid].users);
    console.log(`${username} joined room ${roomid}`);
  });


  

  socket.on('language_change', ({ roomid, language }) => {
    if (rooms[roomid]) {
        // Update the room's language
        rooms[roomid].language = language;
        console.log(`Language updated to ${language} in room ${roomid}`);
        
        // Emit the updated language to all users in the room
        io.to(roomid).emit('language_update', language);
    }
  });


  // Handle user disconnect
  socket.on('disconnect', () => {
    let roomToUpdate = null;
    for (let roomid in rooms) {
      rooms[roomid].users = rooms[roomid].users.filter(user => user.id !== socket.id);
      if (rooms[roomid].users.length === 0) {
        delete rooms[roomid];  // Delete room if no users left
        console.log(`Room ${roomid} deleted as all users left.`);
      } else {
        roomToUpdate = roomid;
      }
    }
    if (roomToUpdate) {
      io.to(roomToUpdate).emit('connected_users', rooms[roomToUpdate].users);  // Broadcast updated users
    }
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
