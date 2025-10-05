import React from 'react';
import { Table } from '../../types/table';

interface TableCardProps {
  table: Table;
  onStatusChange?: (tableId: string, status: Table['status']) => void;
  onSelect?: (table: Table) => void;
  isSelected?: boolean;
  isDraggable?: boolean;
  style?: React.CSSProperties;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  onStatusChange,
  onSelect,
  isSelected = false,
  isDraggable = false,
  style,
}) => {
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: Table['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(table);
    }
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: Table['status']) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(table.id, newStatus);
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg shadow-md border-2 transition-all
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
        ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
        hover:shadow-lg
        ${getStatusColor(table.status)} bg-opacity-10
      `}
      onClick={handleClick}
      style={style}
    >
      {/* Table Name */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">
            {table.location || table.number}
          </h3>
          {table.location && (
            <p className="text-xs text-gray-500">({table.number})</p>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`} />
      </div>

      {/* Capacity */}
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="text-sm text-gray-600">{table.capacity} seats</span>
      </div>

      {/* Status */}
      <div className="text-xs font-medium text-gray-700 mb-2">
        {getStatusText(table.status)}
      </div>

      {/* Location */}
      {table.location && (
        <div className="text-xs text-gray-500 mb-3">
          📍 {table.location}
        </div>
      )}

      {/* Quick Actions */}
      {onStatusChange && (
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={(e) => handleStatusClick(e, 'available')}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
            title="Set Available"
          >
            ✓
          </button>
          <button
            onClick={(e) => handleStatusClick(e, 'occupied')}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
            title="Set Occupied"
          >
            ●
          </button>
          <button
            onClick={(e) => handleStatusClick(e, 'reserved')}
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            title="Set Reserved"
          >
            R
          </button>
          <button
            onClick={(e) => handleStatusClick(e, 'maintenance')}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            title="Set Maintenance"
          >
            🔧
          </button>
        </div>
      )}
    </div>
  );
};

export default TableCard;
