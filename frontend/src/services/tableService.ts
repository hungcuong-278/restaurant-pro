import axios from 'axios';
import { Table, TableAvailability, TableAnalytics } from '../types/table';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const tableService = {
  // Get all tables for a restaurant
  getTables: async (restaurantId: string, status?: string): Promise<Table[]> => {
    const url = status 
      ? `${API_URL}/restaurants/${restaurantId}/tables?status=${status}`
      : `${API_URL}/restaurants/${restaurantId}/tables`;
    const response = await axios.get(url);
    return response.data.data;
  },

  // Get single table
  getTable: async (restaurantId: string, tableId: string): Promise<Table> => {
    const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/tables/${tableId}`);
    return response.data.data;
  },

  // Create new table
  createTable: async (restaurantId: string, tableData: Partial<Table>): Promise<Table> => {
    const response = await axios.post(`${API_URL}/restaurants/${restaurantId}/tables`, tableData);
    return response.data.data;
  },

  // Update table
  updateTable: async (restaurantId: string, tableId: string, updates: Partial<Table>): Promise<Table> => {
    const response = await axios.put(`${API_URL}/restaurants/${restaurantId}/tables/${tableId}`, updates);
    return response.data.data;
  },

  // Delete table
  deleteTable: async (restaurantId: string, tableId: string): Promise<void> => {
    await axios.delete(`${API_URL}/restaurants/${restaurantId}/tables/${tableId}`);
  },

  // Update table status
  updateStatus: async (restaurantId: string, tableId: string, status: Table['status']): Promise<Table> => {
    const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/${tableId}/status`, { status });
    return response.data.data;
  },

  // Update table position
  updatePosition: async (restaurantId: string, tableId: string, position: { x: number; y: number }): Promise<Table> => {
    const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/${tableId}/position`, { position });
    return response.data.data;
  },

  // Get table layout
  getLayout: async (restaurantId: string): Promise<Table[]> => {
    const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/tables/layout`);
    return response.data.data;
  },

  // Bulk update positions
  bulkUpdatePositions: async (
    restaurantId: string, 
    positions: Array<{ id: string; position: { x: number; y: number } }>
  ): Promise<Table[]> => {
    const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/positions/bulk`, { positions });
    return response.data.data;
  },

  // Check table availability
  checkAvailability: async (
    restaurantId: string, 
    date: string, 
    time: string
  ): Promise<TableAvailability> => {
    const response = await axios.get(
      `${API_URL}/restaurants/${restaurantId}/tables/availability/check?date=${date}&time=${time}`
    );
    return response.data.data;
  },

  // Get table analytics
  getAnalytics: async (
    restaurantId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TableAnalytics> => {
    const response = await axios.get(
      `${API_URL}/restaurants/${restaurantId}/tables/analytics/stats?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data.data;
  },
};

export default tableService;
