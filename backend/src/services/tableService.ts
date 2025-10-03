import { Knex } from 'knex';
import db from '../config/database';

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
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableLayout {
  restaurant_id: string;
  layout_config: {
    width: number;
    height: number;
    tables: {
      id: string;
      position: { x: number; y: number };
      rotation?: number;
    }[];
  };
}

export interface TableAvailability {
  table_id: string;
  date: string;
  time_slots: {
    time: string;
    available: boolean;
    reserved_by?: string;
  }[];
}

class TableService {
  // Basic table operations
  async getTablesByRestaurant(restaurantId: string): Promise<Table[]> {
    console.log('[TableService] getTablesByRestaurant called with restaurantId:', restaurantId);
    console.log('[TableService] db type:', typeof db);
    console.log('[TableService] db function check:', typeof db === 'function');
    
    try {
      // Use chained where instead of object syntax to avoid potential issues
      const result = await db('tables')
        .where('restaurant_id', restaurantId)
        .where('is_active', true)
        .orderBy('number', 'asc');
      
      console.log('[TableService] Query successful, found', result.length, 'tables');
      return result;
    } catch (error: any) {
      console.error('[TableService] Query failed:', error?.message || error);
      console.error('[TableService] Error stack:', error?.stack);
      throw error;
    }
  }

  async getTableById(id: string, restaurantId: string): Promise<Table | null> {
    const table = await db('tables')
      .where({ id, restaurant_id: restaurantId })
      .first();
    
    if (!table) return null;

    return {
      ...table,
      position: table.position ? JSON.parse(table.position) : null
    };
  }

  async createTable(data: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
    const tableData = {
      ...data,
      position: data.position ? JSON.stringify(data.position) : null
    };

    const [table] = await db('tables')
      .insert(tableData)
      .returning('*');

    return {
      ...table,
      position: table.position ? JSON.parse(table.position) : null
    };
  }

  async updateTable(id: string, restaurantId: string, data: Partial<Table>): Promise<Table | null> {
    const updateData: any = { ...data };
    
    if (data.position) {
      updateData.position = JSON.stringify(data.position);
    }

    const [table] = await db('tables')
      .where({ id, restaurant_id: restaurantId })
      .update(updateData)
      .returning('*');

    if (!table) return null;

    return {
      ...table,
      position: table.position ? JSON.parse(table.position) : null
    };
  }

  async deleteTable(id: string, restaurantId: string): Promise<boolean> {
    const deleted = await db('tables')
      .where({ id, restaurant_id: restaurantId })
      .update({ is_active: false });
    return deleted > 0;
  }

  // Table status management
  async updateTableStatus(
    id: string, 
    restaurantId: string, 
    status: Table['status'], 
    notes?: string
  ): Promise<Table | null> {
    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    return this.updateTable(id, restaurantId, updateData);
  }

  async getTablesByStatus(restaurantId: string, status: Table['status']): Promise<Table[]> {
    return db('tables')
      .where({ 
        restaurant_id: restaurantId, 
        status, 
        is_active: true 
      })
      .orderBy('number', 'asc');
  }

  async getAvailableTables(
    restaurantId: string, 
    capacity?: number, 
    location?: string
  ): Promise<Table[]> {
    let query = db('tables')
      .where({ 
        restaurant_id: restaurantId, 
        status: 'available', 
        is_active: true 
      });

    if (capacity) {
      query = query.where('capacity', '>=', capacity);
    }

    if (location) {
      query = query.where('location', location);
    }

    return query.orderBy('capacity', 'asc');
  }

  // Table layout management
  async getTableLayout(restaurantId: string): Promise<Table[]> {
    const tables = await this.getTablesByRestaurant(restaurantId);
    return tables.map(table => ({
      ...table,
      position: table.position || { x: 0, y: 0 }
    }));
  }

  async updateTablePosition(
    id: string, 
    restaurantId: string, 
    position: { x: number; y: number }
  ): Promise<Table | null> {
    return this.updateTable(id, restaurantId, { position });
  }

  async bulkUpdateTablePositions(
    restaurantId: string,
    updates: { id: string; position: { x: number; y: number } }[]
  ): Promise<void> {
    const transaction = await db.transaction();
    
    try {
      for (const update of updates) {
        await transaction('tables')
          .where({ id: update.id, restaurant_id: restaurantId })
          .update({ position: JSON.stringify(update.position) });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Table availability and reservations
  async getTableAvailability(
    restaurantId: string,
    date: string,
    tableId?: string
  ): Promise<{ table: Table; reservations: any[] }[]> {
    let tablesQuery = db('tables')
      .where({ restaurant_id: restaurantId, is_active: true });

    if (tableId) {
      tablesQuery = tablesQuery.where('id', tableId);
    }

    const tables = await tablesQuery;

    const result = [];
    
    for (const table of tables) {
      const reservations = await db('reservations')
        .where({
          table_id: table.id,
          reservation_date: date
        })
        .whereIn('status', ['pending', 'confirmed', 'seated']);

      result.push({
        table: {
          ...table,
          position: table.position ? JSON.parse(table.position) : null
        },
        reservations
      });
    }

    return result;
  }

  async checkTableAvailability(
    tableId: string,
    date: string,
    time: string,
    duration: number = 120 // minutes
  ): Promise<boolean> {
    const startTime = new Date(`${date} ${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const conflicts = await db('reservations')
      .where({
        table_id: tableId,
        reservation_date: date
      })
      .whereIn('status', ['pending', 'confirmed', 'seated'])
      .where(function() {
        this.where(function() {
          // Reservation starts before our end time and ends after our start time
          this.where('reservation_time', '<', endTime.toTimeString().slice(0, 5))
            .where(db.raw('TIME(reservation_time, "+2 hours")'), '>', time);
        });
      });

    return conflicts.length === 0;
  }

  // Table statistics
  async getTableUtilizationStats(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    table_id: string;
    table_number: string;
    total_reservations: number;
    total_hours_booked: number;
    utilization_rate: number;
  }[]> {
    const stats = await db('tables')
      .leftJoin('reservations', function() {
        this.on('tables.id', '=', 'reservations.table_id')
          .andOnBetween('reservations.reservation_date', [startDate, endDate])
          .andOnIn('reservations.status', ['confirmed', 'seated', 'completed']);
      })
      .where('tables.restaurant_id', restaurantId)
      .where('tables.is_active', true)
      .groupBy('tables.id', 'tables.number')
      .select(
        'tables.id as table_id',
        'tables.number as table_number',
        db.raw('COUNT(reservations.id) as total_reservations'),
        db.raw('COUNT(reservations.id) * 2 as total_hours_booked'), // Assuming 2-hour slots
        db.raw('(COUNT(reservations.id) * 2.0 / (JULIANDAY(?) - JULIANDAY(?) + 1) / 12) * 100 as utilization_rate', [endDate, startDate])
      );

    return stats;
  }

  // Real-time operations for WebSocket
  async getTableUpdates(restaurantId: string, lastUpdate?: string): Promise<Table[]> {
    let query = db('tables')
      .where({ restaurant_id: restaurantId, is_active: true });

    if (lastUpdate) {
      query = query.where('updated_at', '>', lastUpdate);
    }

    const tables = await query;
    
    return tables.map(table => ({
      ...table,
      position: table.position ? JSON.parse(table.position) : null
    }));
  }
}

export default new TableService();