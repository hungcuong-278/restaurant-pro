import React from 'react';
import { Table } from '../../types/table';

interface TableStatusPanelProps {
  tables: Table[];
  onStatusFilter: (status: Table['status'] | 'all') => void;
  activeFilter: string;
}

const TableStatusPanel: React.FC<TableStatusPanelProps> = ({
  tables,
  onStatusFilter,
  activeFilter,
}) => {
  const getStatusCount = (status: Table['status']) => {
    return tables.filter(t => t.status === status).length;
  };

  const getTotalCapacity = () => {
    return tables.reduce((sum, t) => sum + t.capacity, 0);
  };

  const getAvailableCapacity = () => {
    return tables
      .filter(t => t.status === 'available')
      .reduce((sum, t) => sum + t.capacity, 0);
  };

  const statusButtons = [
    {
      status: 'all' as const,
      label: 'All Tables',
      count: tables.length,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      icon: '📊',
    },
    {
      status: 'available' as const,
      label: 'Available',
      count: getStatusCount('available'),
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: '✓',
    },
    {
      status: 'occupied' as const,
      label: 'Occupied',
      count: getStatusCount('occupied'),
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      icon: '●',
    },
    {
      status: 'reserved' as const,
      label: 'Reserved',
      count: getStatusCount('reserved'),
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      icon: '📅',
    },
    {
      status: 'maintenance' as const,
      label: 'Maintenance',
      count: getStatusCount('maintenance'),
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      icon: '🔧',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Table Status Overview
      </h2>

      {/* Status Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statusButtons.map(({ status, label, count, color, hoverColor, icon }) => (
          <button
            key={status}
            onClick={() => onStatusFilter(status)}
            className={`
              p-4 rounded-lg text-white transition-all
              ${color} ${hoverColor}
              ${activeFilter === status ? 'ring-4 ring-blue-300 shadow-lg scale-105' : 'shadow-md'}
            `}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs font-medium opacity-90">{label}</div>
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{tables.length}</div>
          <div className="text-sm text-gray-600">Total Tables</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{getAvailableCapacity()}</div>
          <div className="text-sm text-gray-600">Available Seats</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{getTotalCapacity()}</div>
          <div className="text-sm text-gray-600">Total Capacity</div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Table Utilization</span>
          <span>
            {tables.length > 0 
              ? Math.round(((getStatusCount('occupied') + getStatusCount('reserved')) / tables.length) * 100)
              : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full transition-all duration-500"
            style={{
              width: `${tables.length > 0 
                ? ((getStatusCount('occupied') + getStatusCount('reserved')) / tables.length) * 100
                : 0}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TableStatusPanel;
