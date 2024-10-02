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
app.use(express.json());

let connectedUsers = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ username, room }) => {
        connectedUsers[socket.id] = username;
        socket.join(room);// User joins the specified room
        io.to(room).emit('user_connected', { username, users: connectedUsers });
        console.log(`User ${username} joined room: ${room}`);
    });

    socket.on('code_change', ({ room, code }) => {
        socket.broadcast.to(room).emit('code_update', code);
    });

    socket.on('run_code', ({ room, language, code }) => {
        // Create a temporary file
        let filePath, command;

        // Check the selected language and assign appropriate file extension and command
        if (language === 'javascript') {
            filePath = path.join(__dirname, 'temp.js');
            command = `node ${filePath}`;
        } else if (language === 'python') {
            filePath = path.join(__dirname, 'temp.py');
            command = `python ${filePath}`;  // Use python command to execute Python script
        }
        // Write the code to the temporary file
        fs.writeFile(filePath, code, (err) => {
          

            if (err) {
                console.error('Error writing file:', err);
                return;
            }

            // Execute the temporary file
            exec(command, (error, stdout, stderr) => {
                // Delete the temporary file after execution
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                    }
                });

                const output = error ? stderr : stdout;
                io.to(room).emit('code_output', output); // Send output to all users in the room

                if (error) {
                    console.error(`Execution error: ${error.message}`);
                    console.error(`stderr: ${stderr}`); // Log stderr for debugging
                } else {
                    console.log(`Output: ${stdout}`);
                }
            });
        });
    });

    
    

    socket.on('send_message', ({ room, username, message }) => {
      console.log(`Message received from ${username}: ${message}`);  // Debug message
      io.to(room).emit('receive_message', { username, message });
  });

  socket.on('receive_message', ({ username, message }) => {
    console.log("Message received:", message);  // Debug message
    setMessages((prevMessages) => [...prevMessages, { username, message }]);
});

  
    socket.on('disconnect', () => {
        delete connectedUsers[socket.id];
        io.emit('user_disconnected', connectedUsers);
    });
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
