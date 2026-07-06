import { useState, useEffect } from 'react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import { format } from 'date-fns';

function TimeBlockPanel({ granularity, onGranularityChange, selectedCells, onClearSelection }) {
  const { blocks, selectedBlock, selectBlock, updateBlock, deleteBlock, addBlock, currentDate } = useTimeBlocks();
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDuration, setQuickDuration] = useState(30);

  // 判断选中的格子是否全部为空闲（没有时间块）
  const isAllFree = () => {
    if (selectedCells.length === 0) return false;
    return selectedCells.every(cell => {
      const timeStr = `${String(cell.hour).padStart(2, '0')}:${String(cell.minute).padStart(2, '0')}`;
      return !blocks.some(b => b.start_time <= timeStr && b.end_time > timeStr);
    });
  };

  // 判断选中的格子是否属于同一个时间块（用于编辑）
  const getCommonBlock = () => {
    if (selectedCells.length === 0) return null;
    // 获取第一个格子所在的时间块
    const firstCell = selectedCells[0];
    const timeStr = `${String(firstCell.hour).padStart(2, '0')}:${String(firstCell.minute).padStart(2, '0')}`;
    const block = blocks.find(b => b.start_time <= timeStr && b.end_time > timeStr);
    if (!block) return null;
    // 检查所有选中的格子是否都属于该块
    const allInBlock = selectedCells.every(cell => {
      const ts = `${String(cell.hour).padStart(2, '0')}:${String(cell.minute).padStart(2, '0')}`;
      return block.start_time <= ts && block.end_time > ts;
    });
    return allInBlock ? block : null;
  };

  // 当选中变化时，更新表单
  useEffect(() => {
  const commonBlock = getCommonBlock();
  if (commonBlock) {
    // 编辑已有时间块
    setTitle(commonBlock.title || '');
    setDescription(commonBlock.description || '');
    setStartTime(commonBlock.start_time || '');
    setEndTime(commonBlock.end_time || '');
    setColor(commonBlock.color || '#4F46E5');
    selectBlock(commonBlock);
  } else if (isAllFree() && selectedCells.length > 0) {
    // 新建：按时间排序 selectedCells
    const sortedCells = [...selectedCells].sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    const firstCell = sortedCells[0];
    const lastCell = sortedCells[sortedCells.length - 1];

    const startTimeStr = `${String(firstCell.hour).padStart(2, '0')}:${String(firstCell.minute).padStart(2, '0')}`;
    // 计算结束时间：最后一个格子的开始时间 + 一个粒度
    const endMinute = lastCell.minute + granularity;
    const endHour = lastCell.hour + Math.floor(endMinute / 60);
    const endMinuteFinal = endMinute % 60;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinuteFinal).padStart(2, '0')}`;

    setTitle('');
    setDescription('');
    setStartTime(startTimeStr);
    setEndTime(endTimeStr);
    setColor('#4F46E5');
    selectBlock(null);
  } else {
    // 其他情况：清空表单
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setColor('#4F46E5');
  }
}, [selectedCells, blocks, granularity]);

  const handleSave = async () => {
    // 如果是新建（选中的是空白格）
    if (isAllFree() && selectedCells.length > 0) {
      if (!title.trim()) {
        alert('请输入标题');
        return;
      }
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      // 使用表单中的 startTime 和 endTime
      await addBlock({
        title: title.trim(),
        description: description || '',
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        color: color,
      });
      onClearSelection();
      return;
    }
    // 如果是编辑已有块
    if (selectedBlock) {
      await updateBlock(selectedBlock.id, {
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        color,
      });
    }
  };

  const handleDelete = async () => {
    if (selectedBlock && window.confirm('确定删除？')) {
      await deleteBlock(selectedBlock.id);
      selectBlock(null);
      onClearSelection();
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const defaultStart = format(new Date(), 'HH:mm');
    const end = new Date();
    end.setMinutes(end.getMinutes() + quickDuration);
    const defaultEnd = format(end, 'HH:mm');
    await addBlock({
      title: quickTitle,
      description: '',
      date: dateStr,
      start_time: defaultStart,
      end_time: defaultEnd,
      color: '#4F46E5',
    });
    setQuickTitle('');
  };

  const isCreating = isAllFree() && selectedCells.length > 0;
  const isEditing = !isCreating && selectedBlock;

  return (
    <div className="p-4 space-y-6">
      {/* 时间粒度 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">时间粒度</h3>
        <div className="flex space-x-2">
          {[15, 30, 60].map(g => (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`px-3 py-1 text-sm rounded ${
                granularity === g ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g}分钟
            </button>
          ))}
        </div>
      </div>

      {/* 任务详情 / 新建 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          {isCreating ? '新建时间块' : isEditing ? '任务详情' : '请选择格子'}
        </h3>
        {(isCreating || isEditing) ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder={isCreating ? '输入任务名称' : ''}
                autoFocus={isCreating}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">描述</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">开始</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">结束</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500">颜色</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 p-1 border rounded"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isCreating ? '创建' : '保存'}
              </button>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            {selectedCells.length === 0 ? '点击网格中的格子开始规划' : '选中的格子被占用或跨多个块'}
          </div>
        )}
      </div>

      {/* 快速创建 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">快速创建</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="任务名称"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-2">
            <select
              value={quickDuration}
              onChange={(e) => setQuickDuration(Number(e.target.value))}
              className="flex-1 p-2 border rounded"
            >
              <option value={15}>15分钟</option>
              <option value={30}>30分钟</option>
              <option value={45}>45分钟</option>
              <option value={60}>60分钟</option>
            </select>
            <button
              onClick={handleQuickAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      {/* 统计 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">今日统计</h3>
        <div className="text-sm text-gray-600">
          <p>📊 总任务数：{blocks.length}</p>
          <p>⏱️ 总时长：{blocks.reduce((acc, b) => {
            if (!b.start_time || !b.end_time) return acc;
            const [sH, sM] = b.start_time.split(':').map(Number);
            const [eH, eM] = b.end_time.split(':').map(Number);
            return acc + (eH - sH) * 60 + (eM - sM);
          }, 0)} 分钟</p>
        </div>
      </div>
    </div>
  );
}

export default TimeBlockPanel;