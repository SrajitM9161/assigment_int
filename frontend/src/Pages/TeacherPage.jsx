import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useUser } from '../context/UserContext';

const socket = io('https://dependable-caring-production.up.railway.app/');

export default function TeacherPage() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const { saveUser } = useUser();

  const handleJoin = () => {
    if (!name.trim()) return alert('Please enter your name');

    socket.emit('teacher:join', { name }, (res) => {
      if (res.success) {
        saveUser(res.sessionId, name);
        setJoined(true);
        navigate('/teacher/poll'); // 🔁 redirect to actual poll UI
      } else {
        alert(res.message || 'Failed to join');
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <p className="text-xs text-white bg-[#7765DA] w-fit mx-auto px-3 py-1 rounded-full font-medium mb-4">
        ✨ Intervue Poll
      </p>
      <h1 className="text-3xl font-bold mb-2">Welcome, Teacher 👩‍🏫</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your name below to start creating and managing live polls.
      </p>

      <div className="mb-4 text-left">
        <label className="block text-sm font-medium mb-1">Enter your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-md"
          placeholder="Mr. Kapoor"
        />
      </div>

      <button
        className="mt-4 bg-[#7765DA] hover:bg-[#4F00CE] text-white font-semibold px-6 py-2 rounded"
        onClick={handleJoin}
      >
        Continue
      </button>

      {joined && <p className="mt-6 text-green-600 font-medium">✅ Joined successfully!</p>}
    </div>
  );
}
