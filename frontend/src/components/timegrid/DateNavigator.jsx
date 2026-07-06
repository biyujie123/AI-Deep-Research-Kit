import { format, addDays, subDays } from 'date-fns';

function DateNavigator({ currentDate, onDateChange }) {
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onDateChange(subDays(currentDate, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ◀
        </button>
        <span className="font-medium text-gray-700">
          {format(currentDate, 'yyyy-MM-dd')}
        </span>
        <button
          onClick={() => onDateChange(addDays(currentDate, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ▶
        </button>
      </div>
      <button
        onClick={() => onDateChange(today)}
        className={`text-sm px-3 py-1 rounded ${
          isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        今天
      </button>
    </div>
  );
}

export default DateNavigator;