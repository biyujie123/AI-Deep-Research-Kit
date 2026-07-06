import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/timeline/today';

function TimeLineView({ refreshTrigger = 0 }) {
  const [blocks, setBlocks] = useState([]);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setBlocks(res.data.blocks);
        setMemos(res.data.memos);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取时间线失败:', err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) return <div className="text-gray-400 text-sm p-4">⏳ 加载时间线...</div>;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">📅 今日时间线</h3>
      {blocks.length === 0 && memos.length === 0 && (
        <p className="text-gray-400 text-sm">暂无安排，试着说"下午3点学习2小时"吧</p>
      )}
      {blocks.map(block => (
        <div key={block.id} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
          <div className="font-medium text-gray-800">{block.title}</div>
          <div className="text-xs text-gray-500">
            {new Date(block.start_time).toLocaleTimeString()} - {new Date(block.end_time).toLocaleTimeString()}
          </div>
          {block.description && <div className="text-sm text-gray-600">{block.description}</div>}
        </div>
        
      ))}
      {memos.map(memo => (
        <div key={memo.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
          <div className="text-sm text-gray-800">{memo.content}</div>
          {memo.remind_at && (
            <div className="text-xs text-gray-500">⏰ {new Date(memo.remind_at).toLocaleString()}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TimeLineView;