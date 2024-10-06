import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import InviteFriendButton from './InviteFriendButton';

const socket = io('http://localhost:5000');

const EditorPage = () => {
    const { roomid, username } = useParams();
    
    const [language, setLanguage] = useState('javascript');
    const [connectedUsers, setConnectedUsers] = useState([]);

    useEffect(() => {

        socket.emit('join_room', { username, roomid: roomid });

        socket.on('room_joined', (roomid) => {
            console.log(`Joined room: ${roomid}`);
        });

        socket.on('language_update', (newLanguage) => {
            setLanguage(newLanguage);  // Update the language in the editor
        });


        socket.on('connected_users', (users) => {setConnectedUsers(users);
            console.log('Connected users:',users);
        });

        socket.on('user_disconnected', (users) => setConnectedUsers(Object.values(users)));
        

        return () => {
            
            socket.off('room_joined');
            
            socket.off('language_update');
            
            socket.off('connected_users');
            socket.off('user_disconnected');
            
        };
    }, [roomid, username]);

    
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);  // Update the local state
    
        // Emit the language change to the server
        socket.emit('language_change', { roomid: roomid, language: newLanguage });
    };
    



    

    

    return (
        <div className="flex h-screen">
            {/* Sidebar for users and chat */}
            <div className="w-1/4 p-3 bg-gray-800 text-white">
                
                <h2 className="text-lg font-bold mb-4">Connected Users</h2>
                <ul>
                    {connectedUsers.map((user, index) => (
                        <li key={index} className="py-2 px-4 bg-gray-700 rounded mb-2">{user.username}</li>
                    ))}
                </ul>
                
                <div className="">
                    <h2 className="text-lg font-bold">Select Language</h2>
                    <select value={language} onChange={handleLanguageChange} className="w-full py-2 px-3 rounded bg-gray-700">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>
                  
                    <InviteFriendButton/>
                </div>
            </div>


            {/* Code editor and output */}
            

            {/* Chat */}
            
        </div>
    );
};

export default EditorPage;
