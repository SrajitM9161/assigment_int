import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import ChatPopup from '../components/ChatPopup';
import { useUser } from '../context/UserContext';

const socket = io('https://assigment-int-1.onrender.com'); // ✅ Your Render backend

export default function StudentPage() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const { saveUser, sessionId } = useUser(); // ✅ Access context

  const handleJoin = () => {
    if (!name.trim()) return alert('Please enter your name');
    if (joined) return; // ✅ prevent double clicks

    socket.emit('student:join', { name }, (res) => {
      if (res.success) {
        saveUser(res.sessionId, name); // ✅ Save to context + localStorage
        setJoined(true);
      } else {
        alert(res.message);
      }
    });
  };

  // ✅ Navigate only when both joined and sessionId are available
  useEffect(() => {
    if (joined && sessionId) {
      console.log('✅ Navigating with sessionId:', sessionId);
      navigate('/student/poll');
    }
  }, [joined, sessionId, navigate]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <p className="text-xs text-white bg-[#7765DA] w-fit mx-auto px-3 py-1 rounded-full font-medium mb-4">
        ✨ Intervue Poll
      </p>
      <h1 className="text-3xl font-bold mb-2">
        Let’s <span className="text-black">Get Started</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your name to join the live poll system as a student.
      </p>

      <div className="mb-4 text-left">
        <label className="block text-sm font-medium mb-1">Enter your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-md"
          placeholder="Rahul Bajaj"
        />
      </div>

      <button
        className="mt-4 bg-[#7765DA] hover:bg-[#4F00CE] text-white font-semibold px-6 py-2 rounded"
        onClick={handleJoin}
      >
        Continue
      </button>

      {joined && <p className="mt-6 text-green-600 font-medium">✅ Joined successfully!</p>}

      <button
        className="fixed bottom-6 right-6 bg-[#7765DA] hover:bg-[#4F00CE] text-white p-4 rounded-full shadow-lg"
        onClick={() => setChatOpen(true)}
      >
        💬
      </button>
      {chatOpen && <ChatPopup socket={socket} onClose={() => setChatOpen(false)} />}
    </div>
  );
}
