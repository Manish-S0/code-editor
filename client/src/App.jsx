import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';

const socket = io('http://localhost:5000');

const App = () => {
    const [code, setCode] = useState('// Write your code here...');
    const [output, setOutput] = useState(''); // State for output
    const [language, setLanguage] = useState('javascript');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [username, setUsername] = useState('Anonymous');
    const [connectedUsers, setConnectedUsers] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
            // Automatically join the room 'default' upon connection
            socket.emit('join_room', { username, room: 'default' });
        });

        // Listen for incoming messages
        socket.on('receive_message', ({ username, message }) => {
            console.log('Received message:', { username, message });
            setMessages((prevMessages) => [...prevMessages, { username, message }]);
        });

        socket.on('code_update', (newCode) => setCode(newCode));
        
        socket.on('code_output', (output) => {
            console.log('Received output:', output); // Add logging to confirm the output is received
            setOutput(output); // Update the output state
        });

        socket.on('user_connected', ({ username, users }) => {
            console.log('User connected:', username);
            setConnectedUsers(Object.values(users));
        });

        socket.on('user_disconnected', (users) => {
            console.log('User disconnected', users);
            setConnectedUsers(Object.values(users));
        });

        return () => {
            socket.off('connect');
            socket.off('receive_message'); 
            socket.off('code_update');
            socket.off('code_output'); // Clean up code_output listener
            socket.off('user_connected');
            socket.off('user_disconnected');
        };
    }, [username]);

    // Emit code changes to the server
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socket.emit('code_change', { room: 'default', code: newCode });
    };

    // Emit run code event to the server
    const handleRunCode = () => {
        if (code.trim() === '' || code.trim() === '// Write your code here...') {
            alert('Please write valid code before running it.');
            return;
        }
        console.log('Run code button clicked');
        socket.emit('run_code', { room: 'default', language, code });
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() === '') return;

        console.log("Sending message:", inputMessage); 
        socket.emit('send_message', { room: 'default', username, message: inputMessage });
        // setMessages((prevMessages) => [...prevMessages, { username, message: inputMessage }]);
        setInputMessage('');
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 p-4 bg-gray-800 text-white">
                <h2 className="text-lg font-bold mb-4">Connected Users</h2>
                <ul>
                    {connectedUsers.map((user, index) => (
                        <li key={index} className="py-2 px-4 bg-gray-700 rounded mb-2">{user}</li>
                    ))}
                </ul>

                <h2 className="text-lg font-bold mt-8 mb-4">Select Language</h2>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full py-2 px-3 rounded bg-gray-700">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>

                <button
                    onClick={handleRunCode}
                    className="mt-4 w-full py-2 px-4 bg-blue-600 rounded">Run Code</button>
            </div>

            <div className="w-3/4 p-4 bg-gray-800 text-white border-4 border-gray-900">
                <MonacoEditor
                    height="60vh"
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                />
                <div className="mt-2 h-full">
                    <h3 className="text-lg font-bold">Output</h3>
                    <div className="bg-gray-900 h-[24vh] text-white p-4 rounded mt-2">
                        {output ? (
                            <pre>{output}</pre>  // Use <pre> to display code/output more neatly
                        ) : (
                            <div>No output yet...</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-1/4 p-4 bg-gray-800 text-white flex flex-col">
                <h2 className="text-lg font-bold mb-4">Chat</h2>
                <div className="overflow-y-auto flex-grow mb-4">
                    {messages.length === 0 ? (
                        <div className="text-gray-400">No messages yet...</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-2">
                                <strong>{msg.username}: </strong> {msg.message}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full py-2 px-3 rounded bg-gray-700 mb-2"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="py-2 w-full px-4 bg-blue-600 rounded">Send</button>
                </div>
            </div>
        </div>
    );
};

export default App;
