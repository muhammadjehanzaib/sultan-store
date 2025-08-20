'use client';

import React, { useState, useEffect } from 'react';

interface DateTimePickerProps {
  value?: string | Date | null;
  onChange: (value: string | null) => void;
  label: string;
  min?: string;
  placeholder?: string;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  min,
  placeholder,
  className = ''
}) => {
  const [dateValue, setDateValue] = useState<string>('');
  const [timeValue, setTimeValue] = useState<string>('12:00');

// Parse the input value and set date/time separately
  useEffect(() => {
    if (value) {
      try {
        let date: Date;
        if (typeof value === 'string') {
          if (value.includes('T') && value.length === 16) {
            // Already in datetime-local format
            const [datePart, timePart] = value.split('T');
            setDateValue(datePart);
            setTimeValue(timePart);
            return;
          }
          date = new Date(value);
        } else {
          date = value;
        }

        if (!isNaN(date.getTime())) {
          // Extract date parts using local timezone
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          setDateValue(`${year}-${month}-${day}`);
          setTimeValue(`${hours}:${minutes}`);
        }
      } catch (error) {
        console.warn('Error parsing datetime value:', error);
        setDateValue('');
        setTimeValue('12:00');
      }
    } else {
      setDateValue('');
      setTimeValue('12:00');
    }
  }, [value]);

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    if (newDate && timeValue) {
      onChange(`${newDate}T${timeValue}`);
    } else {
      onChange(null);
    }
  };

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (dateValue && newTime) {
      onChange(`${dateValue}T${newTime}`);
    } else if (dateValue) {
      onChange(`${dateValue}T${newTime}`);
    }
  };

  // Clear the datetime
  const handleClear = () => {
    setDateValue('');
    setTimeValue('12:00');
    onChange(null);
  };

  // Get current datetime for default min
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Clear
          </button>
        )}
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Date Input */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            📅 Select Date
          </label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={min ? min.split('T')[0] : undefined}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Select date"
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            🕐 Select Time
          </label>
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="900" // 15 minute intervals
          />
        </div>
      </div>

      {/* Preview */}
      {dateValue && timeValue && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">Selected:</span> {' '}
            {new Date(`${dateValue}T${timeValue}`).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      )}

      {/* Quick Set Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            handleDateChange(`${year}-${month}-${day}`);
            handleTimeChange('09:00');
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
        >
          Today 9:00 AM
        </button>
        
        <button
          type="button"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const year = tomorrow.getFullYear();
            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const day = String(tomorrow.getDate()).padStart(2, '0');
            handleDateChange(`${year}-${month}-${day}`);
            handleTimeChange('09:00');
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
        >
          Tomorrow 9:00 AM
        </button>

        <button
          type="button"
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const year = nextWeek.getFullYear();
            const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
            const day = String(nextWeek.getDate()).padStart(2, '0');
            handleDateChange(`${year}-${month}-${day}`);
            handleTimeChange('09:00');
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
        >
          Next Week
        </button>
      </div>

      {placeholder && !dateValue && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          {placeholder}
        </p>
      )}
    </div>
  );
};
