// --- TeacherPoll.jsx ---
import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import OptionInput from '../components/OptionInput';
import TimeDropdown from '../components/TimeDropdown';
import ChatWindow from '../components/ChatPopup';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const socket = io('https://assigment-int-1.onrender.com/');

export default function TeacherPoll() {
  const { sessionId, name } = useContext(UserContext);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [chatOpen, setChatOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [responseStats, setResponseStats] = useState(null);
  const [activePollExists, setActivePollExists] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && name) {
      socket.emit('teacher:join', { name }, () => {});
    }
  }, []);

  useEffect(() => {
    socket.on('participants:update', (data) => setParticipants(data));

    socket.on('poll_result_update', (data) => {
      if (data.results && participants.length > 0) {
        const totalVotes = data.results.reduce((acc, cur) => acc + cur.count, 0);
        const percent = Math.round((totalVotes / participants.length) * 100);
        setResponseStats({ totalVotes, percent });
      }
    });

    socket.on('poll_ended', () => {
      toast.success('⏳ Poll ended automatically');
      setActivePollExists(false);
    });

    socket.on('new_poll', () => {
      setActivePollExists(true);
    });

    return () => {
      socket.off('participants:update');
      socket.off('poll_result_update');
      socket.off('poll_ended');
      socket.off('new_poll');
    };
  }, [participants]);

  const updateOptionText = (index, newText) => {
    const updated = [...options];
    updated[index].text = newText;
    setOptions(updated);
  };

  const setCorrectOption = (index) => {
    const updated = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleSubmit = () => {
    const trimmed = options.filter((opt) => opt.text.trim() !== '');
    if (!question || trimmed.length < 2) {
      return toast.error('Enter a question and at least 2 options');
    }
    const hasCorrect = trimmed.some((opt) => opt.isCorrect);
    if (!hasCorrect) return toast.error('Select the correct answer');

    socket.emit('teacher:create_poll', { question, options: trimmed, timeLimit });
    toast.success('✅ Poll created');

    setQuestion('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setTimeLimit(60);
    setResponseStats(null);
  };

  const kickStudent = (sessionId) => {
    socket.emit('kick_student', { sessionId }, (res) => {
      if (!res.success) toast.error(res.message);
      else toast.success('Student kicked');
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <p className="text-xs text-white bg-[#7765DA] w-fit px-3 py-1 rounded-full font-medium mb-4">
        ✨ Intervue Poll
      </p>

      <h1 className="text-3xl font-bold mb-2">
        Let’s <span className="text-black">Get Started</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Create and manage polls, ask questions, and monitor your students’ responses in real-time.
      </p>

      <div className="mb-4">
        <label className="block font-medium mb-2">Enter your question</label>
        <div className="flex items-center justify-between gap-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full p-3 border rounded-lg resize-none"
            maxLength={100}
            placeholder="e.g. Which planet is known as the Red Planet?"
          />
          <TimeDropdown value={timeLimit} onChange={setTimeLimit} />
        </div>
        <p className="text-right text-xs text-gray-400">{question.length}/100</p>
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-medium">Edit Options</p>
        <p className="font-medium mr-4">Is it Correct?</p>
      </div>

      {options.map((opt, idx) => (
        <OptionInput
          key={idx}
          index={idx}
          option={opt}
          onTextChange={updateOptionText}
          onCorrectChange={setCorrectOption}
        />
      ))}

      {options.length < 5 && (
        <button
          onClick={addOption}
          className="mt-2 text-sm text-[#7765DA] border px-3 py-1 rounded"
        >
          + Add More option
        </button>
      )}

      {responseStats && (
        <div className="text-sm mt-4 text-gray-600">
          ✅ {responseStats.totalVotes} votes submitted ({responseStats.percent}% participants)
        </div>
      )}

      <div className="mt-8 text-right space-x-2">
        <button
          className="bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/teacher/history')}
        >
          View History
        </button>
        <button
          className={`bg-[#7765DA] hover:bg-[#4F00CE] text-white font-semibold px-6 py-2 rounded ${activePollExists ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={activePollExists}
        >
          Ask Question
        </button>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          className="bg-[#7765DA] hover:bg-[#4F00CE] text-white p-4 rounded-full shadow-lg"
          onClick={() => setChatOpen(true)}
        >
          💬
        </button>
        {chatOpen && (
          <ChatWindow
            socket={socket}
            onClose={() => setChatOpen(false)}
            participants={participants}
            isTeacher={true}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onKick={kickStudent}
          />
        )}
      </div>
    </div>
  );
}
