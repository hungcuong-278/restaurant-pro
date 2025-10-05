import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';

export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
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
      const url = `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables${status ? `?status=${status}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  // Get single table
  async getTable(tableId: string): Promise<Table> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching table:', error);
      throw error;
    }
  },

  // Create table
  async createTable(tableData: CreateTableData): Promise<Table> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
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
      const response = await axios.patch(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${tableId}`,
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
      await axios.delete(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${tableId}`
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
