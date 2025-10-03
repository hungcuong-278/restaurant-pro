// Table Types
export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location?: string;
  position?: {
    x: number;
    y: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableLayout {
  tables: Table[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface TableStatusUpdate {
  id: string;
  status: Table['status'];
}

export interface TablePositionUpdate {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface BulkPositionUpdate {
  positions: TablePositionUpdate[];
}

export interface TableAvailability {
  date: string;
  time: string;
  availableTables: Table[];
  totalCapacity: number;
}

export interface TableAnalytics {
  totalTables: number;
  availableCount: number;
  occupiedCount: number;
  reservedCount: number;
  maintenanceCount: number;
  utilizationRate: number;
  averageCapacity: number;
}
