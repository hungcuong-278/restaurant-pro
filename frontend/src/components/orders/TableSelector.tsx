import React, { useState, useEffect } from 'react';
import tableService, { Table } from '../../services/tableService';
import Spinner from '../common/Spinner';

interface TableSelectorProps {
  selectedTableId?: string;
  onSelectTable: (tableId: string, tableNumber: string) => void;
  className?: string;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  selectedTableId,
  onSelectTable,
  className = '',
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getTables();
      setTables(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-300 hover:bg-green-100';
      case 'occupied':
        return 'bg-red-50 border-red-300 cursor-not-allowed opacity-60';
      case 'reserved':
        return 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'occupied':
        return '🔴';
      case 'reserved':
        return '⏰';
      default:
        return '🪑';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">❌ {error}</p>
        <button
          onClick={fetchTables}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const availableTables = tables.filter(t => t.status === 'available');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const reservedTables = tables.filter(t => t.status === 'reserved');

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Select Table
        </h3>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>✅ Available: {availableTables.length}</span>
          <span>🔴 Occupied: {occupiedTables.length}</span>
          <span>⏰ Reserved: {reservedTables.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const isAvailable = table.status === 'available' || table.status === 'reserved';

          return (
            <button
              key={table.id}
              onClick={() => {
                if (isAvailable) {
                  onSelectTable(table.id, table.location || table.number);
                }
              }}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${getTableStatusColor(table.status)}
                ${isSelected ? 'ring-4 ring-blue-500 border-blue-500 bg-blue-50' : ''}
                ${isAvailable ? 'hover:shadow-md' : ''}
              `}
            >
              {/* Table Name/Location */}
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {table.location || table.number}
                </div>
                <div className="text-lg mb-1">
                  {getTableStatusIcon(table.status)}
                </div>
                <div className="text-xs text-gray-600">
                  {table.capacity} seats
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                    ✓
                  </span>
                </div>
              )}

              {/* Status Label */}
              <div className="mt-2 text-[10px] font-medium uppercase tracking-wide">
                {table.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tables available
        </div>
      )}

      {/* Selected Info */}
      {selectedTableId && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✅ Table selected:{' '}
            <span className="font-bold">
              Table {tables.find(t => t.id === selectedTableId)?.number}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TableSelector;
