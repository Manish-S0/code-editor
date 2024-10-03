import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Home from './components/Home';
import JoinRoom from './components/JoinRoom';
import EditorPage from './components/EditorPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/editor/:roomid/:username" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
