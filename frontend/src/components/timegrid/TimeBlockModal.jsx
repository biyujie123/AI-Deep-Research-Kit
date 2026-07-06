import { useState } from 'react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import { format } from 'date-fns';

function TimeBlockModal({ onClose, initialBlock = null }) {
  const { addBlock, updateBlock, currentDate } = useTimeBlocks();
  const isEdit = !!initialBlock;

  const [title, setTitle] = useState(initialBlock?.title || '');
  const [description, setDescription] = useState(initialBlock?.description || '');
  const [date, setDate] = useState(
    initialBlock?.date || format(currentDate, 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState(initialBlock?.start_time || '09:00');
  const [endTime, setEndTime] = useState(initialBlock?.end_time || '10:00');
  const [color, setColor] = useState(initialBlock?.color || '#4F46E5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { title, description, date, start_time: startTime, end_time: endTime, color };
      if (isEdit) {
        await updateBlock(initialBlock.id, data);
      } else {
        await addBlock(data);
      }
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? '编辑时间块' : '创建时间块'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">描述</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">开始</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">结束</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">颜色</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 p-1 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? '保存中...' : (isEdit ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TimeBlockModal;