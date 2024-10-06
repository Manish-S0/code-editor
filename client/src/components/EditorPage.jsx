import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { io } from "socket.io-client";
import InviteFriendButton from "./InviteFriendButton";

const socket = io("http://localhost:5000");

const EditorPage = () => {
  const { roomid, username } = useParams();

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    socket.emit("join_room", { username, roomid: roomid });

    socket.on("room_joined", (roomid) => {
      console.log(`Joined room: ${roomid}`);
    });

    socket.on("language_update", (newLanguage) => {
      setLanguage(newLanguage); // Update the language in the editor
    });
    socket.on("code_update", (newCode) => setCode(newCode));

    socket.on("code_output", (output) => setOutput(output));

    socket.on("connected_users", (users) => {
      setConnectedUsers(users);
      console.log("Connected users:", users);
    });

    // Listen for message history when joining
    socket.on('message_history', (history) => {
      setMessages(history); // Set the messages state with the received history
      console.log('Message history:', history);
  });

  socket.on('receive_message', ({ username, message }) => {
    setMessages((prevMessages) => [...prevMessages, { username, message }]);
  });

    socket.on("user_disconnected", (users) =>
      setConnectedUsers(Object.values(users))
    );

    return () => {
      socket.off("room_joined");
      socket.off("code_update");
      socket.off("code_output");
      socket.off("language_update");
      socket.off('message_history');
      socket.off("connected_users");
      socket.off("user_disconnected");
      socket.off('receive_message');
    };
  }, [roomid, username]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage); // Update the local state

    // Emit the language change to the server
    socket.emit("language_change", { roomid: roomid, language: newLanguage });
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code_change", { roomid: roomid, code: newCode });
  };

  const handleRunCode = () => {
    if (code.trim()) {
      socket.emit("run_code", { roomid: roomid, language, code });
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
        socket.emit('send_message', { roomid: roomid, username, message: inputMessage });
        setInputMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for users and chat */}
      <div className="w-1/4 p-3 bg-gray-800 text-white">
        <h2 className="text-lg font-bold mb-4">Connected Users</h2>
        <ul>
          {connectedUsers.map((user, index) => (
            <li key={index} className="py-2 px-4 bg-gray-700 rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>

        <div className="">
          <h2 className="text-lg font-bold">Select Language</h2>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full py-2 px-3 rounded bg-gray-700"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <button
            onClick={handleRunCode}
            className="mt-4 w-full py-2 px-4 bg-blue-600 rounded"
          >
            Run Code
          </button>

          <InviteFriendButton />
        </div>
      </div>

      {/* Code editor and output */}
      <div className="w-3/4 p-4 bg-gray-800 text-white">
        <MonacoEditor
          height="60vh"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
        />
        <div className="mt-4">
          <h3 className="text-lg font-bold pb-1">Output</h3>
          <div className="bg-gray-900 h-[27vh] text-white p-4 rounded overflow-y-auto">
            {output ? <pre>{output}</pre> : <div>No output yet...</div>}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="w-1/4 p-4 bg-gray-800 text-white flex flex-col">
        <h2 className="text-lg font-bold mb-4">Chat</h2>
        <div className="overflow-y-auto flex-grow mb-4">
          {messages.length === 0 ? (
            <div className="text-gray-400">No messages yet...</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.username}: </strong>
                {msg.message}
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
            className="py-2 w-full px-4 bg-blue-600 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
