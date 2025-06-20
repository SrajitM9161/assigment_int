import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PollHistory() {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/poll/history');
        setPolls(res.data || []);
      } catch (err) {
        console.error('Error fetching poll history:', err);
      }
    };

    fetchPolls();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Poll History</h1>
        <button
          onClick={() => navigate('/teacher/poll')}
          className="bg-[#7765DA] hover:bg-[#4F00CE] text-white font-medium px-4 py-2 rounded"
        >
          🔙 Back to Polling
        </button>
      </div>

      {polls.length === 0 ? (
        <p className="text-gray-500">No polls found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-2 border-b">Question</th>
                <th className="px-4 py-2 border-b">Created At</th>
                <th className="px-4 py-2 border-b">Top Answer</th>
                <th className="px-4 py-2 border-b">Total Responses</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => {
                const mostAnswered = poll.options.reduce((max, option) =>
                  (option.count || 0) > (max.count || 0) ? option : max,
                  {}
                );
                return (
                  <tr key={poll.id} className="text-sm text-gray-700 border-t">
                    <td className="px-4 py-2 border-b max-w-xs truncate" title={poll.question}>{poll.question}</td>
                    <td className="px-4 py-2 border-b">{new Date(poll.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border-b text-[#7765DA]">
                      {mostAnswered.text} ({mostAnswered.percent || 0}%)
                    </td>
                    <td className="px-4 py-2 border-b">{poll.totalResponses}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
