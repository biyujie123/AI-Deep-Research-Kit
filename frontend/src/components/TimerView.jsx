import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/timer/status';

function TimerView({ refreshTrigger = 0 }) {
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setTimer(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return null;
  if (!timer || !timer.is_running) return null;

  const progress = (timer.elapsed / timer.total) * 100;
  const remaining = Math.max(0, timer.total - timer.elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">⏱️ 倒计时</span>
        <span className="text-lg font-mono text-blue-600">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default TimerView;