import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ChatWindow from '../components/ChatPopup';
import Loader from '../components/Loader';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

const socket = io('https://assigment-int-1.onrender.com');

export default function StudentPoll() {
  const { sessionId, name } = useUser();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [pollEnded, setPollEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [submissionRate, setSubmissionRate] = useState(0);

  useEffect(() => {
    if (sessionId && name) {
      socket.emit('student:join', { name, sessionId }, (res) => {
        if (!res.success) toast.error(res.message || 'Failed to join');
      });
    }
  }, [sessionId, name]);

  useEffect(() => {
    socket.on('new_poll', (pollData) => {
      if (sessionId && name) {
        socket.emit('student:join', { name, sessionId }, (res) => {
          if (!res.success) toast.error('Re-join failed');
        });
      }

      setPoll(pollData);
      setSelected(null);
      setHasAnswered(false);
      setResults([]);
      setPollEnded(false);
      setIsLoading(false);
      setTimeLeft(pollData.timeLimit);
      toast.success('📢 New poll started!');
    });

    socket.on('poll_result_update', (data) => {
      if (data.pollId === poll?.pollId) setResults(data.results);
    });

    socket.on('poll_ended', (data) => {
      if (data.pollId === poll?.pollId) {
        setResults(data.results);
        setPollEnded(true);
        setTimeLeft(0);
        toast('⏱️ Poll ended!', { icon: '🔚' });
      }
    });

    socket.on('student_answered_count_update', ({ pollId, answered, total }) => {
      if (poll?.pollId === pollId) {
        setAnsweredCount(answered);
        const rate = total > 0 ? Math.round((answered / total) * 100) : 0;
        setSubmissionRate(rate);
      }
    });

    socket.on('participants:update', (list) => setParticipants(list));

    const loaderTimeout = setTimeout(() => setIsLoading(false), 2000);

    return () => {
      socket.off('new_poll');
      socket.off('poll_result_update');
      socket.off('poll_ended');
      socket.off('participants:update');
      socket.off('student_answered_count_update');
      clearTimeout(loaderTimeout);
    };
  }, [poll, sessionId, name]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !pollEnded) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, pollEnded]);

  const submitAnswer = () => {
    if (!selected) return toast.error('Please select an option.');
    if (!sessionId || !name) return toast.error('Missing session ID.');

    socket.emit(
      'submit_answer',
      {
        pollId: poll.pollId,
        optionId: selected,
        sessionId, // added
        name, // added
      },
      (res) => {
        if (res.success) {
          setHasAnswered(true);
          toast.success('✅ Answer submitted!');
        } else {
          toast.error(res.message || 'Submission failed.');
        }
      }
    );
  };

  const getPercent = (optionId) => results.find(r => r.optionId === optionId)?.percent || 0;

  if (isLoading) return <LoaderScreen />;
  if (!poll) return <NoPollScreen />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Question 1</h2>
        <div className="flex gap-3 items-center">
          {timeLeft !== null && !pollEnded && (
            <div className="text-sm text-red-600 font-bold flex items-center">
              ⏱️ <span className="ml-1">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          )}
          <span className="text-sm text-green-700 font-medium">
            Submitted {answeredCount}/{participants.length} ({submissionRate}%)
          </span>
        </div>
      </div>

      <div className="bg-[#1F2937] text-white px-4 py-3 rounded-t-md font-semibold">
        {poll.question}
      </div>

      <div className="border rounded-b-md overflow-hidden">
        {poll.options.map((opt, idx) => {
          const percent = getPercent(opt.id);
          const isCorrect = pollEnded && opt.isCorrect;
          const isWrong = pollEnded && selected === opt.id && !isCorrect;

          return (
            <div
              key={opt.id}
              onClick={() => !hasAnswered && !pollEnded && setSelected(opt.id)}
              className={`relative px-4 py-3 cursor-pointer transition-all border-t
                ${selected === opt.id && !pollEnded ? 'border-2 border-[#7765DA] bg-[#F2EEFF]' : ''}
                ${isCorrect ? 'bg-green-100 border-green-400' : ''}
                ${isWrong ? 'bg-red-100 border-red-400' : ''}`}
            >
              {(hasAnswered || pollEnded) && (
                <div className="absolute inset-0 bg-[#7765DA]/10 z-0 rounded-sm overflow-hidden">
                  <div
                    className="bg-[#7765DA] h-full transition-all duration-700 ease-out z-0"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
              <div className="relative z-10 flex justify-between items-center">
                <span className="font-medium flex gap-2 items-center">
                  <span className="w-5 h-5 bg-[#7765DA] rounded-full flex items-center justify-center text-white text-xs">
                    {idx + 1}
                  </span>
                  {opt.text}
                </span>
                {(hasAnswered || pollEnded) && (
                  <span className="text-sm font-semibold text-gray-700">{percent}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hasAnswered && !pollEnded && (
        <button
          onClick={submitAnswer}
          className="mt-6 bg-[#7765DA] hover:bg-[#4F00CE] text-white font-semibold px-6 py-2 rounded float-right"
        >
          Submit
        </button>
      )}

      {pollEnded && (
        <p className="mt-4 text-center text-sm text-gray-500">
          ⏳ Wait for the teacher to ask a new question.
        </p>
      )}

      <ChatIcon onClick={() => setChatOpen(true)} />
      {chatOpen && (
        <ChatWindow
          socket={socket}
          onClose={() => setChatOpen(false)}
          participants={participants}
          onKick={() => {}}
          isTeacher={false}
        />
      )}
    </div>
  );
}

function LoaderScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <span className="text-white bg-[#7765DA] px-4 py-1 rounded-full text-sm font-medium mb-6">
        ✨ Intervue Poll
      </span>
      <Loader />
      <p className="mt-4 font-medium text-lg">Waiting for the teacher to start a poll...</p>
    </div>
  );
}

function NoPollScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <span className="text-white bg-[#7765DA] px-4 py-1 rounded-full text-sm font-medium mb-6">
        ✨ Intervue Poll
      </span>
      <p className="mt-4 font-medium text-lg">No active poll yet.</p>
    </div>
  );
}

function ChatIcon({ onClick }) {
  return (
    <button
      className="fixed bottom-6 right-6 bg-[#7765DA] hover:bg-[#4F00CE] text-white p-4 rounded-full shadow-lg"
      onClick={onClick}
    >
      💬
    </button>
  );
}
