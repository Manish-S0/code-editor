const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Change this to your frontend URL
        methods: ["GET", "POST"]
    }
});

app.use(cors());

let rooms = {};  // To store room data

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    // Create room
    socket.on('create_room', ({ roomid, username }) => {
  
      if (!username || !roomid) {
        console.log('Invalid username or roomid');
        return;
      }
  
      rooms[roomid] = {
        users: [{ id: socket.id, username }]  
      };
      socket.join(roomid);
  
      io.to(socket.id).emit('room_created', roomid);
      
      console.log(`Room ${roomid} created by ${username}`);
    });

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

});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

