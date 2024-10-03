import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust URL as needed

const JoinRoom = () => {
  const [roomid, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Join room handler
    const handleRoomJoined = (roomid) => {
      console.log('Room joined:', roomid);
      if (roomid) {
        navigate(`/editor/${roomid}/${username}`);
      }
    };

    const handleRoomNotFound = (message) => {
      console.log(message);
      alert(message);
    };

    // Listen for room events
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_not_found', handleRoomNotFound);

    // Cleanup listeners on unmount
    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_not_found', handleRoomNotFound);
    };
  }, [username, navigate]);

  const handleJoinRoom = () => {
    if (!roomid || !username) {
      alert('Please enter both Room ID and Username');
      return;
    }

    console.log('Joining room:', { roomid, username });
    // Emit join_room event with roomid and username
    socket.emit('join_room', { roomid, username });
  };

  return (
    <div>
      <h2>Join Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomid}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
};

export default JoinRoom;
