// --- ChatPopup.jsx ---
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext'; // ✅ Correct import

export default function ChatPopup({ socket, onClose, isTeacher }) {
  const { sessionId, name } = useUser(); // ✅ Correct usage of context
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [tab, setTab] = useState('chat');

  useEffect(() => {
    socket.on('chat:receive', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('participants:update', (data) => {
      setParticipants(data);
    });

    socket.on('kicked', ({ reason }) => {
      window.location.href = '/kicked';
    });

    socket.emit('participants:get');

    return () => {
      socket.off('chat:receive');
      socket.off('participants:update');
      socket.off('kicked');
    };
  }, [socket]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('chat:message', {
      sender: name,
      sessionId,
      message,
    });
    setMessage('');
  };

  const handleKick = (sessionId) => {
    if (confirm('Are you sure you want to remove this student?')) {
      socket.emit('kick_student', { sessionId }, (res) => {
        if (!res.success) alert(res.message);
      });
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white border rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center bg-[#7765DA] text-white px-4 py-2 rounded-t-lg">
        <p className="font-semibold">💬 Intervue Chat</p>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="flex text-sm">
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 py-2 ${tab === 'chat' ? 'bg-gray-100 font-medium' : ''}`}
        >
          Chat
        </button>
        <button
          onClick={() => setTab('participants')}
          className={`flex-1 py-2 ${tab === 'participants' ? 'bg-gray-100 font-medium' : ''}`}
        >
          Participants
        </button>
      </div>

      {tab === 'chat' && (
        <div className="h-64 overflow-y-auto px-4 py-2 space-y-2">
          {messages.map((msg, idx) => {
            const isMe = msg.sender === name;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg px-3 py-2 text-sm max-w-[75%] ${
                    isMe ? 'bg-[#7765DA] text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">{msg.sender}</div>
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'participants' && (
        <div className="h-64 overflow-y-auto px-4 py-2 space-y-2">
          {participants.map((user) => (
            <div
              key={user.sessionId}
              className="flex justify-between items-center text-sm border-b py-1"
            >
              <span>{user.name}</span>
              {isTeacher && (
                <button
                  className="text-red-500 text-xs hover:underline"
                  onClick={() => handleKick(user.sessionId)}
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex border-t p-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-1 text-sm border rounded-l"
        />
        <button
          onClick={sendMessage}
          className="bg-[#7765DA] text-white px-3 rounded-r text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
