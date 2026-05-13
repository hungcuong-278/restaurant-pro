import knex from '../config/database';

interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  table_number?: string;
  capacity: number;
  status: string;
  location?: string;
  position?: string;
  notes?: string;
  is_active?: number;
}

interface Reservation {
  id: string;
  table_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
}

/**
 * Get available tables for booking
 * Returns tables that are:
 * 1. Active (is_active = 1)
 * 2. Available status
 * 3. Have enough capacity for party size
 * 4. Not reserved at the requested date/time
 */
export const getAvailableTablesForBooking = async (
  restaurantId: string,
  date: string,
  time: string,
  partySize?: number
): Promise<Table[]> => {
  try {
    // Get all active tables for the restaurant
    let query = knex('tables')
      .where('restaurant_id', restaurantId)
      .where('is_active', 1)
      .where('status', 'available');

    // Filter by capacity if party size is provided
    if (partySize) {
      query = query.where('capacity', '>=', partySize);
    }

    const tables = await query.select('*');

    // Filter out tables that have reservations at the same date/time
    const availableTables: Table[] = [];

    for (const table of tables) {
      // Check if table has a reservation at this date/time
      const reservation = await knex('reservations')
        .where('table_id', table.id)
        .where('reservation_date', date)
        .where('reservation_time', time)
        .whereIn('status', ['pending', 'confirmed'])
        .first();

      if (!reservation) {
        // Add table_number alias for frontend compatibility
        availableTables.push({
          ...table,
          table_number: table.number
        });
      }
    }

    return availableTables;
  } catch (error) {
    console.error('Error getting available tables:', error);
    throw error;
  }
};

/**
 * Get all tables for a restaurant
 */
export const getTables = async (restaurantId: string, status?: string): Promise<Table[]> => {
  try {
    let query = knex('tables')
      .where('restaurant_id', restaurantId)
      .where('is_active', 1);

    if (status) {
      query = query.where('status', status);
    }

    const tables = await query.select('*').orderBy('number', 'asc');
    
    // Add table_number alias
    return tables.map((table: Table) => ({
      ...table,
      table_number: table.number
    }));
  } catch (error) {
    console.error('Error getting tables:', error);
    throw error;
  }
};

/**
 * Get single table by ID
 */
export const getTableById = async (tableId: string): Promise<Table | null> => {
  try {
    const table = await knex('tables')
      .where('id', tableId)
      .where('is_active', 1)
      .first();

    if (!table) {
      return null;
    }

    return {
      ...table,
      table_number: table.number
    };
  } catch (error) {
    console.error('Error getting table:', error);
    throw error;
  }
};

/**
 * Update table status
 */
export const updateTableStatus = async (
  tableId: string,
  status: string
): Promise<Table | null> => {
  try {
    await knex('tables')
      .where('id', tableId)
      .update({
        status,
        updated_at: knex.fn.now()
      });

    return await getTableById(tableId);
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

// Stub methods for compatibility with tableController
export const getTablesByStatus = async (restaurantId: string, status: string): Promise<Table[]> => {
  return getTables(restaurantId, status);
};

export const getTablesByRestaurant = async (restaurantId: string): Promise<Table[]> => {
  return getTables(restaurantId);
};

export const createTable = async (data: any): Promise<Table> => {
  throw new Error('Not implemented');
};

export const updateTable = async (tableId: string, restaurantId: string, data: any): Promise<Table | null> => {
  throw new Error('Not implemented');
};

export const deleteTable = async (tableId: string, restaurantId: string): Promise<boolean> => {
  throw new Error('Not implemented');
};

export const updateTablePosition = async (tableId: string, restaurantId: string, position: any): Promise<Table | null> => {
  throw new Error('Not implemented');
};

export const getTableLayout = async (restaurantId: string): Promise<any> => {
  throw new Error('Not implemented');
};

export const bulkUpdateTablePositions = async (restaurantId: string, positions: any[]): Promise<any> => {
  throw new Error('Not implemented');
};

export const getTableUtilizationStats = async (restaurantId: string, startDate: string, endDate: string): Promise<any> => {
  throw new Error('Not implemented');
};
