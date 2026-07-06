import { useState } from 'react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import DateNavigator from '../timegrid/DateNavigator';
import TimeBlockGrid from '../timegrid/TimeBlockGrid';
import TimeBlockPanel from '../timegrid/TimeBlockPanel';

function TimeBlockTab() {
  const { currentDate, goToDate } = useTimeBlocks();
  const [granularity, setGranularity] = useState(30);
  const [selectedCells, setSelectedCells] = useState([]); // 选中的格子

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <DateNavigator currentDate={currentDate} onDateChange={goToDate} />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white">
          <TimeBlockGrid
            granularity={granularity}
            selectedCells={selectedCells}
            onSelectionChange={setSelectedCells}
          />
        </div>
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <TimeBlockPanel
            granularity={granularity}
            onGranularityChange={setGranularity}
            selectedCells={selectedCells}
            onClearSelection={() => setSelectedCells([])}
          />
        </div>
      </div>
    </div>
  );
}

export default TimeBlockTab;