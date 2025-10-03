import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchTables,
  updateTableStatus,
  updateTablePosition,
  selectTable,
  createTable,
  deleteTable,
} from '../../store/slices/tableSlice';
import TableLayout from '../../components/tables/TableLayout';
import TableStatusPanel from '../../components/tables/TableStatusPanel';
import { Table } from '../../types/table';

const TableManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, selectedTable, loading, error } = useSelector((state: RootState) => state.tables);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Table['status'] | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableData, setNewTableData] = useState({
    number: '',
    capacity: 4,
    location: '',
    status: 'available' as Table['status'],
  });

  // Mock restaurant ID - replace with actual from auth
  const restaurantId = 'f46275c0-9917-44fc-b144-e1e9cff89075';

  useEffect(() => {
    dispatch(fetchTables(restaurantId));
  }, [dispatch, restaurantId]);

  const handleStatusChange = async (tableId: string, status: Table['status']) => {
    await dispatch(updateTableStatus({ restaurantId, id: tableId, status }));
  };

  const handlePositionChange = async (tableId: string, position: { x: number; y: number }) => {
    await dispatch(updateTablePosition({ restaurantId, id: tableId, position }));
  };

  const handleTableSelect = (table: Table) => {
    dispatch(selectTable(table));
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createTable({ restaurantId, tableData: newTableData }));
    setShowCreateModal(false);
    setNewTableData({
      number: '',
      capacity: 4,
      location: '',
      status: 'available',
    });
  };

  const handleDeleteTable = async () => {
    if (selectedTable && window.confirm(`Delete table ${selectedTable.number}?`)) {
      await dispatch(deleteTable({ restaurantId, id: selectedTable.id }));
      dispatch(selectTable(null));
    }
  };

  const filteredTables = statusFilter === 'all' 
    ? tables 
    : tables.filter(t => t.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant floor plan and table status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isEditMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isEditMode ? '✓ Exit Edit Mode' : '✏️ Edit Layout'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
            >
              + Add Table
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tables...</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status Panel */}
          <TableStatusPanel
            tables={tables}
            onStatusFilter={setStatusFilter}
            activeFilter={statusFilter}
          />

          {/* Table Layout */}
          <TableLayout
            tables={filteredTables}
            onTableSelect={handleTableSelect}
            onTableStatusChange={handleStatusChange}
            onTablePositionChange={handlePositionChange}
            selectedTable={selectedTable}
            isEditMode={isEditMode}
          />

          {/* Selected Table Details */}
          {selectedTable && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Table {selectedTable.number}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Capacity: {selectedTable.capacity} seats</p>
                    <p>Status: {selectedTable.status}</p>
                    {selectedTable.location && <p>Location: {selectedTable.location}</p>}
                    {selectedTable.position && (
                      <p>Position: ({selectedTable.position.x}, {selectedTable.position.y})</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDeleteTable}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Table
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Table</h2>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number *
                </label>
                <input
                  type="text"
                  required
                  value={newTableData.number}
                  onChange={(e) => setNewTableData({ ...newTableData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., T01, Table 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={newTableData.capacity}
                  onChange={(e) => setNewTableData({ ...newTableData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newTableData.location}
                  onChange={(e) => setNewTableData({ ...newTableData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Window Section, Patio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={newTableData.status}
                  onChange={(e) => setNewTableData({ ...newTableData, status: e.target.value as Table['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagementPage;
