import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust URL as needed

const CreateRoom = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = (roomid) => {
      console.log('Room created:', roomid);
      if (roomid) {
        navigate(`/editor/${roomid}/${username}`);
      }
    };

    socket.on('room_created', handleRoomCreated);

    // Cleanup listener
    return () => {
      socket.off('room_created', handleRoomCreated);
    };
  }, [username, navigate]);

  const handleCreateRoom = () => {
    if (!username) {
      alert('Please enter a username');
      return;
    }

    const roomid = Math.random().toString(36).substring(2, 9);  // Random room ID
    console.log('Creating room:', { roomid, username });
    socket.emit('create_room', { roomid, username });
  };

  return (
    <div>
      <h2>Create Room</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
