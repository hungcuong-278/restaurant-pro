/**
 * TableSelector Component
 * 
 * Displays available tables and allows user to select one.
 * Features:
 * - Grid layout of available tables
 * - Table capacity display
 * - Location information
 * - Selected state highlighting
 * - Empty state when no tables available
 */

import React from 'react';
import { TableAvailability } from '../../types/reservation';

interface TableSelectorProps {
  availableTables: TableAvailability[];
  selectedTable: TableAvailability | null;
  onTableSelect: (table: TableAvailability) => void;
  partySize: number;
  isLoading?: boolean;
  disabled?: boolean;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  availableTables,
  selectedTable,
  onTableSelect,
  partySize,
  isLoading = false,
  disabled = false,
}) => {
  // Filter tables that can accommodate party size
  const suitableTables = availableTables.filter(
    (table) => table.capacity >= partySize
  );

  // Get capacity range text
  const getCapacityText = (capacity: number): string => {
    if (capacity === 1) return '1 person';
    return `Up to ${capacity} people`;
  };

  // Get table icon based on capacity
  const getTableIcon = (capacity: number): JSX.Element => {
    if (capacity <= 2) {
      return (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    } else if (capacity <= 4) {
      return (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      );
    } else {
      return (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="8" width="16" height="8" rx="2" />
        </svg>
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-none p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gr-gold border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Checking table availability...</p>
        </div>
      </div>
    );
  }

  // No tables available
  if (availableTables.length === 0) {
    return (
      <div className="bg-white border-2 border-red-200 rounded-none p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gr-black mb-2">No Tables Available</h3>
          <p className="text-gray-600 mb-4">
            Unfortunately, there are no tables available for the selected date and time.
          </p>
          <p className="text-sm text-gray-500">
            Please try a different date or time slot.
          </p>
        </div>
      </div>
    );
  }

  // No suitable tables for party size
  if (suitableTables.length === 0) {
    return (
      <div className="bg-white border-2 border-yellow-200 rounded-none p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-gr-black mb-2">No Suitable Tables</h3>
          <p className="text-gray-600 mb-4">
            No tables can accommodate {partySize} {partySize === 1 ? 'person' : 'people'} at the selected time.
          </p>
          <p className="text-sm text-gray-500">
            Please try adjusting your party size or selecting a different time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gr-black mb-2">Select Your Table</h3>
        <p className="text-gray-600">
          {suitableTables.length} {suitableTables.length === 1 ? 'table' : 'tables'} available for {partySize} {partySize === 1 ? 'person' : 'people'}
        </p>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suitableTables.map((table) => {
          const isSelected = selectedTable?.id === table.id;

          return (
            <button
              key={table.id}
              onClick={() => onTableSelect(table)}
              disabled={disabled}
              className={`
                bg-white border-2 rounded-none p-6 text-left transition-all duration-200
                hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected 
                  ? 'border-gr-gold bg-gold-50 shadow-lg' 
                  : 'border-gray-300 hover:border-gr-gold'
                }
              `}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="flex justify-end mb-2">
                  <span className="bg-gr-gold text-white text-xs font-bold px-3 py-1 rounded-none uppercase tracking-wide">
                    Selected
                  </span>
                </div>
              )}

              {/* Table Icon */}
              <div className={`mb-4 ${isSelected ? 'text-gr-gold' : 'text-gray-400'}`}>
                {getTableIcon(table.capacity)}
              </div>

              {/* Table Number */}
              <h4 className="text-2xl font-bold text-gr-black mb-2">
                Table {table.table_number}
              </h4>

              {/* Capacity */}
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {getCapacityText(table.capacity)}
                </span>
              </div>

              {/* Location (if available) */}
              {table.location && (
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {table.location}
                  </span>
                </div>
              )}

              {/* Perfect Match Badge */}
              {table.capacity === partySize && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-green-600 font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Perfect match for your party
                  </span>
                </div>
              )}

              {/* Extra Capacity Info */}
              {table.capacity > partySize && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    +{table.capacity - partySize} extra {table.capacity - partySize === 1 ? 'seat' : 'seats'} available
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Table Summary */}
      {selectedTable && (
        <div className="bg-green-50 border-2 border-green-200 rounded-none p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gr-black mb-1">
                Table {selectedTable.table_number} Selected
              </h4>
              <p className="text-gray-700">
                Capacity: {getCapacityText(selectedTable.capacity)}
                {selectedTable.location && ` • Location: ${selectedTable.location}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            All tables shown are available for your selected date and time. Select your preferred table to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableSelector;
