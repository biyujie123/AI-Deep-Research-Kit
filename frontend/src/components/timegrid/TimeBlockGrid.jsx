import { useState } from 'react';
import { useTimeBlocks } from '../../context/TimeBlockContext';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function TimeBlockGrid({ granularity = 30, selectedCells, onSelectionChange }) {
  const { blocks, loading, selectedBlock, selectBlock, currentDate } = useTimeBlocks();
  const [lastSelectedCell, setLastSelectedCell] = useState(null);

  const getMinuteSlots = () => {
    const slots = [];
    for (let m = 0; m < 60; m += granularity) {
      slots.push(m);
    }
    return slots;
  };
  const MINUTE_SLOTS = getMinuteSlots();
  const colsPerHour = MINUTE_SLOTS.length;

  // 获取某个格子的列索引（从0开始，对应 grid-column 偏移）
  const getColIndex = (minute) => MINUTE_SLOTS.indexOf(minute);
  const isCellSelected = (hour, minute) => {
    return selectedCells.some(c => c.hour === hour && c.minute === minute);
  };

  // 判断格子是否被占用
  const isTimeSlotOccupied = (hour, minute) => {
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return blocks.some(b => b.start_time <= timeStr && b.end_time > timeStr);
  };

  const getBlockAt = (hour, minute) => {
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return blocks.find(b => b.start_time <= timeStr && b.end_time > timeStr);
  };

  // 计算时间块的网格跨度
  const getBlockSpan = (block) => {
    const startH = parseInt(block.start_time.split(':')[0]);
    const startM = parseInt(block.start_time.split(':')[1]);
    const endH = parseInt(block.end_time.split(':')[0]);
    const endM = parseInt(block.end_time.split(':')[1]);
    const startCol = getColIndex(startM);
    const endCol = getColIndex(endM);
    const span = endCol - startCol;
    return { startRow: startH, endRow: endH, startCol, span: Math.max(span, 1) };
  };

  // 范围选择逻辑（与之前相同）
  const getCellsInRange = (cell1, cell2) => {
    const minHour = Math.min(cell1.hour, cell2.hour);
    const maxHour = Math.max(cell1.hour, cell2.hour);
    const minMinuteIdx = Math.min(
      MINUTE_SLOTS.indexOf(cell1.minute),
      MINUTE_SLOTS.indexOf(cell2.minute)
    );
    const maxMinuteIdx = Math.max(
      MINUTE_SLOTS.indexOf(cell1.minute),
      MINUTE_SLOTS.indexOf(cell2.minute)
    );
    const cells = [];
    for (let h = minHour; h <= maxHour; h++) {
      for (let idx = minMinuteIdx; idx <= maxMinuteIdx; idx++) {
        cells.push({ hour: h, minute: MINUTE_SLOTS[idx] });
      }
    }
    return cells;
  };

  const handleCellClick = (hour, minute, event) => {
    const cell = { hour, minute };
    if (event.ctrlKey || event.metaKey) {
      onSelectionChange(prev => {
        const exists = prev.some(c => c.hour === hour && c.minute === minute);
        if (exists) {
          return prev.filter(c => !(c.hour === hour && c.minute === minute));
        } else {
          return [...prev, cell];
        }
      });
      setLastSelectedCell(cell);
      return;
    }
    if (event.shiftKey && lastSelectedCell) {
      const rangeCells = getCellsInRange(lastSelectedCell, cell);
      onSelectionChange(prev => {
        const combined = [...prev];
        rangeCells.forEach(c => {
          if (!combined.some(ex => ex.hour === c.hour && ex.minute === c.minute)) {
            combined.push(c);
          }
        });
        return combined;
      });
      setLastSelectedCell(cell);
      return;
    }
    onSelectionChange([cell]);
    setLastSelectedCell(cell);
  };

  const handleBlankCellClick = (hour, minute, event) => {
    handleCellClick(hour, minute, event);
  };

  const handleBlockClick = (block, event) => {
    const startH = parseInt(block.start_time.split(':')[0]);
    const startM = parseInt(block.start_time.split(':')[1]);
    const endH = parseInt(block.end_time.split(':')[0]);
    const endM = parseInt(block.end_time.split(':')[1]);
    const cells = [];
    for (let h = startH; h <= endH; h++) {
      const startMin = (h === startH) ? startM : 0;
      const endMin = (h === endH) ? endM : 60;
      for (let m = startMin; m < endMin; m += granularity) {
        cells.push({ hour: h, minute: m });
      }
    }
    if (event.ctrlKey || event.metaKey) {
      onSelectionChange(prev => {
        const combined = [...prev];
        cells.forEach(c => {
          if (!combined.some(ex => ex.hour === c.hour && ex.minute === c.minute)) {
            combined.push(c);
          }
        });
        return combined;
      });
    } else if (event.shiftKey && lastSelectedCell) {
      const firstCell = cells[0];
      const rangeCells = getCellsInRange(lastSelectedCell, firstCell);
      onSelectionChange(prev => {
        const combined = [...prev];
        rangeCells.forEach(c => {
          if (!combined.some(ex => ex.hour === c.hour && ex.minute === c.minute)) {
            combined.push(c);
          }
        });
        return combined;
      });
      setLastSelectedCell(cells[cells.length - 1]);
    } else {
      onSelectionChange(cells);
      setLastSelectedCell(cells[cells.length - 1]);
    }
    selectBlock(block);
  };

  const clearSelection = () => {
    onSelectionChange([]);
    setLastSelectedCell(null);
    selectBlock(null);
  };

  if (loading) return <div className="p-4 text-gray-500">加载中...</div>;

  // 构建 grid 列模板
  const gridCols = `60px repeat(${colsPerHour}, 1fr)`;
  const gridRows = `repeat(24, 32px)`;

  return (
    <div className="p-4" onClick={clearSelection}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: gridCols,
          gridTemplateRows: gridRows,
          gap: '0px',
          position: 'relative',
        }}
      >
        {/* 时间轴 */}
        {HOURS.map(hour => (
          <div
            key={`time-${hour}`}
            className="text-right text-xs text-gray-400 pr-2 leading-8"
            style={{ gridRow: hour + 1, gridColumn: 1 }}
          >
            {String(hour).padStart(2, '0')}:00
          </div>
        ))}

        {/* 网格单元格 */}
        {HOURS.map(hour => (
          MINUTE_SLOTS.map((minute, idx) => {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const block = getBlockAt(hour, minute);
            const isSelected = isCellSelected(hour, minute);

            if (block) {
              // 检查是否是该块的第一个单元格（避免重复渲染）
              const startCol = getColIndex(parseInt(block.start_time.split(':')[1]));
              if (idx === startCol) {
                const { startRow, endRow, span } = getBlockSpan(block);
                const isBlockSelected = selectedBlock && selectedBlock.id === block.id;
                // 使用 grid-column: span span
                return (
                  <div
                    key={`${hour}-${minute}`}
                    className="rounded-md px-1 py-0.5 text-xs text-white font-medium cursor-pointer hover:opacity-80 transition"
                    style={{
                      gridRow: `${startRow + 1} / span ${endRow - startRow + 1}`,
                      gridColumn: `${idx + 2} / span ${span}`,
                      backgroundColor: block.color || '#4F46E5',
                      zIndex: 10,
                      boxShadow: isBlockSelected ? '0 0 0 2px #3B82F6, 0 0 0 4px white' : 'none',
                      minHeight: '28px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlockClick(block, e);
                    }}
                  >
                    {block.title || '（空）'}
                  </div>
                );
              }
              return null;
            }

            // 空白格子
            return (
              <div
                key={`${hour}-${minute}`}
                className={`border-r border-gray-100 cursor-pointer transition ${
                  isSelected ? 'bg-blue-200 ring-1 ring-blue-500' : 'hover:bg-blue-50'
                }`}
                style={{
                  gridRow: hour + 1,
                  gridColumn: idx + 2,
                  height: '32px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlankCellClick(hour, minute, e);
                }}
                title={`${timeStr} - 点击选中`}
              />
            );
          })
        ))}
      </div>

      {/* 选中提示 */}
      {selectedCells.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-xs rounded flex items-center justify-between">
          <span>已选中 {selectedCells.length} 个时间块</span>
          <button onClick={clearSelection} className="text-blue-500 hover:text-blue-700">
            取消选择
          </button>
        </div>
      )}
    </div>
  );
}

export default TimeBlockGrid;