import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust URL as needed

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
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className='text-4xl mb-4'>Join Room</h2>
      <div className='flex flex-col gap-4'>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomid}
        onChange={(e) => setRoomId(e.target.value)}
        className='px-4 py-2 bg-gray-700 rounded'
      />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className='px-4 py-2 bg-gray-700 rounded'
      />
      <button onClick={handleJoinRoom}
      className=' py-2 px-4 bg-green-600 rounded'>Join Room</button>
      </div>
    </div>
  );
};

export default JoinRoom;
