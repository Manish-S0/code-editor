import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-4xl mb-8">Collaborative Code Editor</h1>
            <div className="flex space-x-4">
                <Link to="/create-room" className="px-4 py-2 bg-blue-600 rounded">Create Room</Link>
                <Link to="/join-room" className="px-4 py-2 bg-green-600 rounded">Join Room</Link>
            </div>
        </div>
    );
};

export default Home;
