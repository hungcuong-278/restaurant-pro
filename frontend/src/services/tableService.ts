import api from './api';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  location?: string;  // Display name like "Le Château", "Roma Intima"
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  position?: string;
  notes?: string;
  is_active?: number;
  created_at: string;
  updated_at: string;
  current_order_id?: string;
}

export interface CreateTableData {
  number: string;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
}

export interface UpdateTableData {
  number?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
}

const tableService = {
  // Get all tables
  async getTables(status?: string): Promise<Table[]> {
    try {
      const url = `${API_BASE_URL}/tables${status ? `?status=${status}` : ''}`;
      const response = await api.get(url);
      // Backend returns { success: true, data: [...] }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  // Get single table
  async getTable(tableId: string): Promise<Table> {
    try {
      const response = await api.get(
        `${API_BASE_URL}/tables/${tableId}`
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching table:', error);
      throw error;
    }
  },

  // Create table
  async createTable(tableData: CreateTableData): Promise<Table> {
    try {
      const response = await api.post(
        `${API_BASE_URL}/tables`,
        tableData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  },

  // Update table
  async updateTable(tableId: string, tableData: UpdateTableData): Promise<Table> {
    try {
      const response = await api.patch(
        `${API_BASE_URL}/tables/${tableId}`,
        tableData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  },

  // Delete table
  async deleteTable(tableId: string): Promise<void> {
    try {
      await api.delete(
        `${API_BASE_URL}/tables/${tableId}`
      );
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  },

  // Get available tables
  async getAvailableTables(): Promise<Table[]> {
    return this.getTables('available');
  },
};

export default tableService;

