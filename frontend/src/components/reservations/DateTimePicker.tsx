/**
 * DateTimePicker Component
 * 
 * Allows users to select reservation date and time.
 * Features:
 * - Calendar view for date selection
 * - Disable past dates
 * - Time slot grid with availability
 * - Business hours validation
 */

import React, { useState, useEffect } from 'react';
import { 
  generateTimeSlots, 
  isPastDate, 
  isTooSoon,
  isTooFarAhead,
  formatDateForDisplay,
  formatTimeForDisplay 
} from '../../services/reservationService';
import { DEFAULT_BUSINESS_HOURS } from '../../types/reservation';

interface DateTimePickerProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  restaurantId: string;
  partySize: number;
  disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  restaurantId,
  partySize,
  disabled = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Generate time slots based on business hours
  useEffect(() => {
    const slots = generateTimeSlots(
      DEFAULT_BUSINESS_HOURS.open,
      DEFAULT_BUSINESS_HOURS.close,
      DEFAULT_BUSINESS_HOURS.timeSlotInterval
    );
    setAvailableTimeSlots(slots);
  }, []);

  // Get days in current month
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty slots for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(0)); // Placeholder
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const daysInMonth = getDaysInMonth(currentMonth);

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Check if a date is selectable
  const isDateSelectable = (date: Date): boolean => {
    if (date.getTime() === 0) return false; // Placeholder
    const dateString = formatDateString(date);
    return !isPastDate(dateString) && !isTooFarAhead(dateString);
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date) || disabled) return;
    const dateString = formatDateString(date);
    onDateChange(dateString);
    // Reset time when date changes (pass null instead of empty string)
    if (selectedTime) {
      onTimeChange('');
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    if (disabled) return;
    
    // Check if selected time is too soon
    if (selectedDate && isTooSoon(selectedDate, time)) {
      alert('Please book at least 2 hours in advance');
      return;
    }
    
    onTimeChange(time);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    if (!selectedDate || date.getTime() === 0) return false;
    return formatDateString(date) === selectedDate;
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gr-black mb-2">Select Date & Time</h3>
        <p className="text-gray-600">Choose your preferred reservation date and time</p>
      </div>

      {/* Calendar Section */}
      <div className="bg-white border-2 border-gray-200 rounded-none p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            disabled={disabled}
            className="p-2 hover:bg-gray-100 rounded-none transition-colors disabled:opacity-50"
            aria-label="Previous month"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h4 className="text-lg font-bold text-gr-black">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>

          <button
            onClick={nextMonth}
            disabled={disabled}
            className="p-2 hover:bg-gray-100 rounded-none transition-colors disabled:opacity-50"
            aria-label="Next month"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date, index) => {
            const selectable = isDateSelectable(date);
            const selected = isSelected(date);
            const today = isToday(date);
            const isEmpty = date.getTime() === 0;

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                disabled={!selectable || disabled}
                className={`
                  aspect-square p-2 text-center rounded-none transition-all duration-200
                  ${isEmpty ? 'invisible' : ''}
                  ${selected ? 'bg-gr-gold text-white font-bold' : ''}
                  ${today && !selected ? 'border-2 border-gr-gold text-gr-gold font-semibold' : ''}
                  ${!selected && !today && selectable ? 'hover:bg-gray-100 text-gr-black' : ''}
                  ${!selectable && !isEmpty ? 'text-gray-300 cursor-not-allowed' : ''}
                  ${selectable && !selected ? 'border border-gray-200' : ''}
                `}
              >
                {!isEmpty && date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-none">
            <p className="text-sm text-gray-600 mb-1">Selected Date:</p>
            <p className="text-lg font-bold text-gr-black">
              {formatDateForDisplay(selectedDate)}
            </p>
          </div>
        )}
      </div>

      {/* Time Slots Section */}
      {selectedDate && (
        <div className="bg-white border-2 border-gray-200 rounded-none p-6">
          <h4 className="text-lg font-bold text-gr-black mb-4">Select Time</h4>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableTimeSlots.map((time) => {
              const isSelectedTime = selectedTime === time;
              const isTooSoonTime = selectedDate && isTooSoon(selectedDate, time);

              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  disabled={disabled || isTooSoonTime}
                  className={`
                    py-3 px-4 text-center rounded-none transition-all duration-200 font-medium
                    ${isSelectedTime 
                      ? 'bg-gr-gold text-white border-2 border-gr-gold' 
                      : 'border-2 border-gray-300 text-gr-black hover:border-gr-gold hover:text-gr-gold'
                    }
                    ${isTooSoonTime ? 'opacity-40 cursor-not-allowed' : ''}
                    disabled:opacity-40 disabled:cursor-not-allowed
                  `}
                  title={isTooSoonTime ? 'Too soon - book at least 2 hours in advance' : ''}
                >
                  {formatTimeForDisplay(time)}
                </button>
              );
            })}
          </div>

          {/* Selected Time Display */}
          {selectedTime && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-none">
              <p className="text-sm text-gray-600 mb-1">Selected Time:</p>
              <p className="text-lg font-bold text-gr-black">
                {formatTimeForDisplay(selectedTime)}
              </p>
            </div>
          )}

          {/* Info Message */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-none">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Booking Information</p>
                <p className="text-xs text-blue-700 mt-1">
                  • Reservations must be made at least 2 hours in advance<br />
                  • Standard reservation duration is 2 hours<br />
                  • Business hours: {formatTimeForDisplay(DEFAULT_BUSINESS_HOURS.open)} - {formatTimeForDisplay(DEFAULT_BUSINESS_HOURS.close)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Date Selected Prompt */}
      {!selectedDate && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-none p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium">Please select a date from the calendar above</p>
          <p className="text-sm text-gray-500 mt-2">Then choose your preferred time slot</p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
