import React, { useState, useRef, useCallback } from 'react';
import { Table } from '../../types/table';
import TableCard from './TableCard';

interface TableLayoutProps {
  tables: Table[];
  onTableSelect?: (table: Table) => void;
  onTableStatusChange?: (tableId: string, status: Table['status']) => void;
  onTablePositionChange?: (tableId: string, position: { x: number; y: number }) => void;
  selectedTable?: Table | null;
  isEditMode?: boolean;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  onTableSelect,
  onTableStatusChange,
  onTablePositionChange,
  selectedTable,
  isEditMode = false,
}) => {
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const layoutRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, table: Table) => {
    if (!isEditMode || !table.position) return;

    setDraggedTable(table.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [isEditMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedTable || !layoutRef.current) return;

    const layoutRect = layoutRef.current.getBoundingClientRect();
    const newX = e.clientX - layoutRect.left - dragOffset.x;
    const newY = e.clientY - layoutRect.top - dragOffset.y;

    // Update position temporarily (visual feedback)
    const tableElement = document.getElementById(`table-${draggedTable}`);
    if (tableElement) {
      tableElement.style.left = `${newX}px`;
      tableElement.style.top = `${newY}px`;
    }
  }, [draggedTable, dragOffset]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!draggedTable || !layoutRef.current || !onTablePositionChange) return;

    const layoutRect = layoutRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - layoutRect.left - dragOffset.x, layoutRect.width - 150));
    const newY = Math.max(0, Math.min(e.clientY - layoutRect.top - dragOffset.y, layoutRect.height - 150));

    onTablePositionChange(draggedTable, { x: newX, y: newY });
    setDraggedTable(null);
  }, [draggedTable, dragOffset, onTablePositionChange]);

  // Filter tables with positions for layout view
  const positionedTables = tables.filter(t => t.position);
  const unpositionedTables = tables.filter(t => !t.position);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Floor Plan Layout
        </h2>
        {isEditMode && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Drag & Drop Mode
          </div>
        )}
      </div>

      {/* Layout Canvas */}
      <div
        ref={layoutRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
        style={{ height: '600px', minHeight: '400px' }}
        onMouseMove={isEditMode ? handleMouseMove : undefined}
        onMouseUp={isEditMode ? handleMouseUp : undefined}
        onMouseLeave={isEditMode ? handleMouseUp : undefined}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Positioned Tables */}
        {positionedTables.map((table) => (
          <div
            key={table.id}
            id={`table-${table.id}`}
            className="absolute"
            style={{
              left: `${table.position!.x}px`,
              top: `${table.position!.y}px`,
              width: '140px',
              cursor: isEditMode ? 'move' : 'pointer',
              transition: draggedTable === table.id ? 'none' : 'all 0.2s',
            }}
            onMouseDown={(e) => isEditMode && handleMouseDown(e, table)}
          >
            <TableCard
              table={table}
              onSelect={onTableSelect}
              onStatusChange={onTableStatusChange}
              isSelected={selectedTable?.id === table.id}
              isDraggable={isEditMode}
            />
          </div>
        ))}

        {/* Empty State */}
        {positionedTables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              <p className="text-lg font-medium">No tables positioned yet</p>
              <p className="text-sm mt-2">
                {isEditMode ? 'Add tables and drag them to position' : 'Switch to edit mode to arrange tables'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Unpositioned Tables List */}
      {unpositionedTables.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            📍 Tables without position ({unpositionedTables.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {unpositionedTables.map((table) => (
              <div key={table.id} className="text-xs bg-white p-2 rounded border border-yellow-300">
                <div className="font-medium">{table.location || table.number}</div>
                {table.location && (
                  <div className="text-xs text-gray-400">({table.number})</div>
                )}
                <div className="text-gray-600">{table.capacity} seats</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          Occupied
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          Reserved
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          Maintenance
        </div>
      </div>
    </div>
  );
};

export default TableLayout;
