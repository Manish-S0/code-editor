import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust URL as needed

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
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-4xl mb-4">Create Room</h2>
      <div className='flex flex-col gap-4'>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className='px-4 py-2 bg-gray-700 rounded'
      />
      <button onClick={handleCreateRoom} className=' py-2 px-4 bg-blue-600 rounded'>Create Room</button>
      </div>
    </div>
  );
};

export default CreateRoom;
