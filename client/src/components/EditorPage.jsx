import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import InviteFriendButton from './InviteFriendButton';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const EditorPage = () => {
  const { roomid, username } = useParams();

  const [language, setLanguage] = useState('javascript');

  useEffect(()=>{
    socket.on('language_update', (newLanguage) => {
      setLanguage(newLanguage);  // Update the language in the editor
  });
  },[username,roomid]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);  // Update the local state

    // Emit the language change to the server
    socket.emit('language_change', { roomid: roomid, language: newLanguage });
  };
  return (
    <div>
      <div>
        <div className="">
          <h2 className="text-lg font-bold">Select Language</h2>
          <select value={language} onChange={handleLanguageChange} className="w-full py-2 px-3 rounded bg-gray-700">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          
          <InviteFriendButton/>
        </div>
      </div>
    </div>
  )
}

export default EditorPage