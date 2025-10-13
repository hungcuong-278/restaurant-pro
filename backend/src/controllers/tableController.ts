import { Request, Response } from 'express';
import * as tableService from '../services/tableService';
import { setLastError, addDebugLog } from '../routes/debugRoutes';

const VALID_STATUSES = ['available', 'occupied', 'reserved', 'maintenance'];

export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    // For now, just get all tables (can add filtering by restaurantId later)
    const status = req.query.status as string;
    const restaurantId = req.params.restaurantId || '1'; // Default restaurant

    let tables;
    if (status) {
      tables = await tableService.getTablesByStatus(restaurantId, status as any);
    } else {
      tables = await tableService.getTablesByRestaurant(restaurantId);
    }

    res.json({ success: true, data: tables });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'getTables', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to fetch tables', error: error.message });
  }
};

export const getTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, id } = req.params;
    const table = await tableService.getTableById(id);

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.json({ success: true, data: table });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'getTable', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to fetch table', error: error.message });
  }
};

export const createTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId;
    const { number, capacity, status, location, position } = req.body;

    if (!number) {
      res.status(400).json({ success: false, message: 'Table number is required' });
      return;
    }

    if (!capacity) {
      res.status(400).json({ success: false, message: 'Table capacity is required' });
      return;
    }

    if (typeof capacity !== 'number' || capacity <= 0) {
      res.status(400).json({ success: false, message: 'Capacity must be a positive number' });
      return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      return;
    }

    const tableData: any = {
      restaurant_id: restaurantId,
      number,
      capacity,
      status: status || 'available',
      location: location || null,
      position: position ? JSON.stringify(position) : null,
      is_active: true
    };

    const newTable = await tableService.createTable(tableData);
    res.status(201).json({ success: true, message: 'Table created successfully', data: newTable });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'createTable', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to create table', error: error.message });
  }
};

export const updateTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, id } = req.params;
    const updates = req.body;

    if (updates.capacity !== undefined && (typeof updates.capacity !== 'number' || updates.capacity <= 0)) {
      res.status(400).json({ success: false, message: 'Capacity must be a positive number' });
      return;
    }

    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      return;
    }

    if (updates.position) {
      updates.position = JSON.stringify(updates.position);
    }

    const updatedTable = await tableService.updateTable(id, restaurantId, updates);

    if (!updatedTable) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.json({ success: true, message: 'Table updated successfully', data: updatedTable });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'updateTable', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to update table', error: error.message });
  }
};

export const deleteTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, id } = req.params;
    const deleted = await tableService.deleteTable(id, restaurantId);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'deleteTable', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to delete table', error: error.message });
  }
};

export const updateTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      return;
    }

    const updatedTable = await tableService.updateTableStatus(id, status);

    if (!updatedTable) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.json({ success: true, message: 'Table status updated successfully', data: updatedTable });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'updateTableStatus', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to update table status', error: error.message });
  }
};

export const updateTablePosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, id } = req.params;
    const { position } = req.body;

    if (!position) {
      res.status(400).json({ success: false, message: 'Position is required' });
      return;
    }

    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      res.status(400).json({ success: false, message: 'Position must contain numeric x and y coordinates' });
      return;
    }

    const updatedTable = await tableService.updateTablePosition(id, restaurantId, position);

    if (!updatedTable) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.json({ success: true, message: 'Table position updated successfully', data: updatedTable });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'updateTablePosition', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to update table position', error: error.message });
  }
};

export const getTableLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId;
    const layout = await tableService.getTableLayout(restaurantId);
    res.json({ success: true, data: layout });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'getTableLayout', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to fetch table layout', error: error.message });
  }
};

export const bulkUpdatePositions = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId;
    const { positions } = req.body;

    if (!Array.isArray(positions) || positions.length === 0) {
      res.status(400).json({ success: false, message: 'Positions must be a non-empty array' });
      return;
    }

    for (const item of positions) {
      if (!item.id || !item.position) {
        res.status(400).json({ success: false, message: 'Each item must have id and position fields' });
        return;
      }

      if (typeof item.position.x !== 'number' || typeof item.position.y !== 'number') {
        res.status(400).json({ success: false, message: 'Position x and y must be numbers' });
        return;
      }
    }

    const result = await tableService.bulkUpdateTablePositions(restaurantId, positions);
    res.json({ success: true, message: 'Table positions updated successfully', data: result });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'bulkUpdatePositions', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to update table positions', error: error.message });
  }
};

export const getTableAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    // Use restaurantId from params or default
    const restaurantId = req.params.restaurantId || 'a8d307c4-40c2-4e11-8468-d65710bae6f3';
    const { date, time, party_size } = req.query;

    if (!date || !time) {
      res.status(400).json({ success: false, message: 'Date and time are required' });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date as string)) {
      res.status(400).json({ success: false, message: 'Date must be in YYYY-MM-DD format' });
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time as string)) {
      res.status(400).json({ success: false, message: 'Time must be in HH:MM format' });
      return;
    }

    const partySize = party_size ? parseInt(party_size as string) : undefined;
    const availableTables = await tableService.getAvailableTablesForBooking(
      restaurantId, 
      date as string, 
      time as string,
      partySize
    );
    
    res.json({ success: true, data: availableTables });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'getTableAvailability', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to check table availability', error: error.message });
  }
};

export const getTableAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ success: false, message: 'Start date and end date are required' });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date as string)) {
      res.status(400).json({ success: false, message: 'start_date must be in YYYY-MM-DD format' });
      return;
    }

    if (!dateRegex.test(end_date as string)) {
      res.status(400).json({ success: false, message: 'end_date must be in YYYY-MM-DD format' });
      return;
    }

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date values' });
      return;
    }

    if (startDate > endDate) {
      res.status(400).json({ success: false, message: 'start_date must be before or equal to end_date' });
      return;
    }

    const analytics = await tableService.getTableUtilizationStats(restaurantId, start_date as string, end_date as string);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    setLastError(error);
    addDebugLog(JSON.stringify({ action: 'getTableAnalytics', error: error.message }));
    res.status(500).json({ success: false, message: 'Failed to fetch table analytics', error: error.message });
  }
};
