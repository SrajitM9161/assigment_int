import { useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import ChatPopup from '../components/ChatPopup';
import { useUser } from '../context/UserContext';

const socket = io('http://localhost:5000');

export default function StudentPage() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const { saveUser } = useUser(); // ✅ grab context

  const handleJoin = () => {
    if (!name.trim()) return alert('Please enter your name');

    socket.emit('student:join', { name }, (res) => {
      if (res.success) {
        saveUser(res.sessionId, name); // ✅ store in context and localStorage
        setJoined(true);
        navigate('/student/poll');
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <p className="text-xs text-white bg-[#7765DA] w-fit mx-auto px-3 py-1 rounded-full font-medium mb-4">
        ✨ Intervue Poll
      </p>
      <h1 className="text-3xl font-bold mb-2">
        Let’s <span className="text-black">Get Started</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        If you’re a student, you’ll be able to{' '}
        <span className="font-semibold text-black">submit your answers</span>, participate in live polls,
        and see how your responses compare with your classmates.
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
