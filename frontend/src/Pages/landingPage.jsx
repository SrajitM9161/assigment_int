import { useState } from 'react';
import RoleCard from '../components/roleCard';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('https://dependable-caring-production.up.railway.app/'); // socket connection

function LandingPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!role) return;

    const name = `${role === 'student' ? 'Student' : 'Teacher'}-${Math.floor(Math.random() * 1000)}`;

    socket.emit(`${role}:join`, { name }, (res) => {
      if (res.success) {
        console.log(`${role} joined ✅`);
        if (!socket.data) socket.data = {}
        socket.data.userId = res.sessionId;
        navigate(`/${role}`);
      } else {
        alert(`Join failed: ${res.message}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-center">
      <div className="mb-3">
        <span className="bg-[#7765DA] text-white text-xs font-semibold px-3 py-1 rounded-full">
          👋 Welcome Poll
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">
        Welcome to the <span className="text-[#4F00CE]">Live Polling System</span>
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        Please select the role that best describes you to begin using the live polling system.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <RoleCard
          title="I'm a Student"
          description="Join as a student to quickly answer live polls presented by your teacher."
          selected={role === 'student'}
          onClick={() => setRole('student')}
        />
        <RoleCard
          title="I'm a Teacher"
          description="Start a session and create live poll questions as a teacher."
          selected={role === 'teacher'}
          onClick={() => setRole('teacher')}
        />
      </div>

      <button
        className="mt-6 bg-[#7765DA] text-white font-medium px-6 py-2 rounded hover:bg-[#4F00CE] transition"
        onClick={handleContinue}
        disabled={!role}
      >
        Continue
      </button>
    </div>
  );
}

export default LandingPage;
