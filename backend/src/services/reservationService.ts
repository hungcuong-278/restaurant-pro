import { Knex } from 'knex';
import db from '../config/database';

export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  notes?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
  table?: {
    number: string;
    capacity: number;
    location?: string;
  };
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  table_options: {
    id: string;
    number: string;
    capacity: number;
    location?: string;
  }[];
}

export interface ReservationFilters {
  date?: string;
  status?: string;
  table_id?: string;
  customer_email?: string;
  page?: number;
  limit?: number;
}

class ReservationService {
  // Basic reservation operations
  async getReservations(
    restaurantId: string,
    filters: ReservationFilters = {}
  ): Promise<{ reservations: Reservation[]; total: number }> {
    const { date, status, table_id, customer_email, page = 1, limit = 10 } = filters;
    
    let query = db('reservations')
      .leftJoin('tables', 'reservations.table_id', 'tables.id')
      .select(
        'reservations.*',
        'tables.number as table_number',
        'tables.capacity as table_capacity',
        'tables.location as table_location'
      )
      .where('reservations.restaurant_id', restaurantId);

    if (date) {
      query = query.where('reservations.reservation_date', date);
    }

    if (status) {
      query = query.where('reservations.status', status);
    }

    if (table_id) {
      query = query.where('reservations.table_id', table_id);
    }

    if (customer_email) {
      query = query.where('reservations.customer_email', 'LIKE', `%${customer_email}%`);
    }

    // Get total count
    const countQuery = query.clone().count('reservations.id as total');
    const [{ total }] = await countQuery;

    // Get paginated results
    const offset = (page - 1) * limit;
    const reservations = await query
      .orderBy('reservations.reservation_date', 'desc')
      .orderBy('reservations.reservation_time', 'asc')
      .limit(limit)
      .offset(offset);

    // Format reservations with table info
    const formattedReservations = reservations.map(reservation => ({
      ...reservation,
      table: reservation.table_number ? {
        number: reservation.table_number,
        capacity: reservation.table_capacity,
        location: reservation.table_location
      } : null,
      // Remove redundant table fields
      table_number: undefined,
      table_capacity: undefined,
      table_location: undefined
    }));

    return {
      reservations: formattedReservations,
      total: Number(total)
    };
  }

  async getReservationById(id: string, restaurantId: string): Promise<Reservation | null> {
    const reservation = await db('reservations')
      .leftJoin('tables', 'reservations.table_id', 'tables.id')
      .select(
        'reservations.*',
        'tables.number as table_number',
        'tables.capacity as table_capacity',
        'tables.location as table_location'
      )
      .where('reservations.id', id)
      .where('reservations.restaurant_id', restaurantId)
      .first();

    if (!reservation) return null;

    return {
      ...reservation,
      table: reservation.table_number ? {
        number: reservation.table_number,
        capacity: reservation.table_capacity,
        location: reservation.table_location
      } : null
    };
  }

  async createReservation(data: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'table'>): Promise<Reservation> {
    // Check availability before creating
    if (data.table_id) {
      const available = await this.checkAvailability(
        data.restaurant_id,
        data.reservation_date,
        data.reservation_time,
        data.table_id
      );

      if (!available) {
        throw new Error('Selected table is not available at the requested time');
      }
    }

    const [reservation] = await db('reservations')
      .insert(data)
      .returning('*');

    const fullReservation = await this.getReservationById(reservation.id, data.restaurant_id);
    if (!fullReservation) {
      throw new Error('Failed to retrieve created reservation');
    }
    
    return fullReservation;
  }

  async updateReservation(
    id: string,
    restaurantId: string,
    data: Partial<Reservation>
  ): Promise<Reservation | null> {
    // If updating table or time, check availability
    if (data.table_id || data.reservation_date || data.reservation_time) {
      const currentReservation = await this.getReservationById(id, restaurantId);
      if (!currentReservation) return null;

      const newTableId = data.table_id || currentReservation.table_id;
      const newDate = data.reservation_date || currentReservation.reservation_date;
      const newTime = data.reservation_time || currentReservation.reservation_time;

      if (newTableId) {
        const available = await this.checkAvailability(
          restaurantId,
          newDate,
          newTime,
          newTableId,
          id // Exclude current reservation from conflict check
        );

        if (!available) {
          throw new Error('Selected table is not available at the requested time');
        }
      }
    }

    const [reservation] = await db('reservations')
      .where({ id, restaurant_id: restaurantId })
      .update(data)
      .returning('*');

    if (!reservation) return null;

    return this.getReservationById(id, restaurantId);
  }

  async cancelReservation(id: string, restaurantId: string): Promise<boolean> {
    const updated = await db('reservations')
      .where({ id, restaurant_id: restaurantId })
      .update({ status: 'cancelled' });

    return updated > 0;
  }

  // Availability checking
  async checkAvailability(
    restaurantId: string,
    date: string,
    time: string,
    tableId?: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    const startTime = new Date(`${date} ${time}`);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    let query = db('reservations')
      .where({
        restaurant_id: restaurantId,
        reservation_date: date
      })
      .whereIn('status', ['pending', 'confirmed', 'seated']);

    if (tableId) {
      query = query.where('table_id', tableId);
    }

    if (excludeReservationId) {
      query = query.whereNot('id', excludeReservationId);
    }

    // Check for time conflicts
    query = query.where(function() {
      this.where(function() {
        // Existing reservation starts before our end time and ends after our start time
        const endTimeStr = endTime.toTimeString().slice(0, 5);
        this.where('reservation_time', '<', endTimeStr)
          .where(db.raw('TIME(reservation_time, "+2 hours")'), '>', time);
      });
    });

    const conflicts = await query;
    return conflicts.length === 0;
  }

  async getAvailableSlots(
    restaurantId: string,
    date: string,
    partySize: number,
    duration: number = 120 // minutes
  ): Promise<AvailabilitySlot[]> {
    // Get restaurant business hours (simplified - assume 11:00 to 22:00)
    const openTime = 11; // 11:00
    const closeTime = 22; // 22:00
    const slotInterval = 30; // 30-minute intervals

    const slots: AvailabilitySlot[] = [];

    // Generate time slots
    for (let hour = openTime; hour < closeTime; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Get available tables for this time slot
        const availableTables = await this.getAvailableTablesForSlot(
          restaurantId,
          date,
          timeStr,
          partySize,
          duration
        );

        slots.push({
          time: timeStr,
          available: availableTables.length > 0,
          table_options: availableTables
        });
      }
    }

    return slots;
  }

  async getAvailableTablesForSlot(
    restaurantId: string,
    date: string,
    time: string,
    partySize: number,
    duration: number = 120
  ): Promise<{ id: string; number: string; capacity: number; location?: string }[]> {
    // Get all tables that can accommodate the party size
    const suitableTables = await db('tables')
      .where({
        restaurant_id: restaurantId,
        is_active: true,
        status: 'available'
      })
      .where('capacity', '>=', partySize)
      .orderBy('capacity', 'asc'); // Prefer smaller tables that fit

    const availableTables = [];

    for (const table of suitableTables) {
      const available = await this.checkAvailability(restaurantId, date, time, table.id);
      if (available) {
        availableTables.push({
          id: table.id,
          number: table.number,
          capacity: table.capacity,
          location: table.location
        });
      }
    }

    return availableTables;
  }

  // Reservation management
  async confirmReservation(
    id: string,
    restaurantId: string,
    confirmedBy: string
  ): Promise<Reservation | null> {
    const updateData = {
      status: 'confirmed' as const,
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy
    };

    return this.updateReservation(id, restaurantId, updateData);
  }

  async seatReservation(id: string, restaurantId: string): Promise<Reservation | null> {
    const reservation = await this.getReservationById(id, restaurantId);
    if (!reservation) return null;

    // Update reservation status to seated
    await this.updateReservation(id, restaurantId, { status: 'seated' });

    // Update table status to occupied if table is assigned
    if (reservation.table_id) {
      await db('tables')
        .where('id', reservation.table_id)
        .update({ status: 'occupied' });
    }

    return this.getReservationById(id, restaurantId);
  }

  async completeReservation(id: string, restaurantId: string): Promise<Reservation | null> {
    const reservation = await this.getReservationById(id, restaurantId);
    if (!reservation) return null;

    // Update reservation status to completed
    await this.updateReservation(id, restaurantId, { status: 'completed' });

    // Free up the table if assigned
    if (reservation.table_id) {
      await db('tables')
        .where('id', reservation.table_id)
        .update({ status: 'available' });
    }

    return this.getReservationById(id, restaurantId);
  }

  // Calendar and reporting
  async getReservationsByDate(
    restaurantId: string,
    date: string
  ): Promise<Reservation[]> {
    const { reservations } = await this.getReservations(restaurantId, {
      date,
      limit: 100 // Get all for the day
    });

    return reservations;
  }

  async getReservationCalendar(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<{ date: string; count: number; reservations: Reservation[] }[]> {
    const reservations = await db('reservations')
      .leftJoin('tables', 'reservations.table_id', 'tables.id')
      .select(
        'reservations.*',
        'tables.number as table_number',
        'tables.capacity as table_capacity',
        'tables.location as table_location'
      )
      .where('reservations.restaurant_id', restaurantId)
      .where('reservations.reservation_date', '>=', startDate)
      .where('reservations.reservation_date', '<=', endDate)
      .orderBy('reservations.reservation_date', 'asc')
      .orderBy('reservations.reservation_time', 'asc');

    // Group by date
    const calendar: { [date: string]: Reservation[] } = {};
    
    reservations.forEach(reservation => {
      const date = reservation.reservation_date;
      if (!calendar[date]) {
        calendar[date] = [];
      }
      
      calendar[date].push({
        ...reservation,
        table: reservation.table_number ? {
          number: reservation.table_number,
          capacity: reservation.table_capacity,
          location: reservation.table_location
        } : null
      });
    });

    // Convert to array format
    return Object.keys(calendar).map(date => ({
      date,
      count: calendar[date].length,
      reservations: calendar[date]
    }));
  }

  // Statistics
  async getReservationStats(
    restaurantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total_reservations: number;
    confirmed_reservations: number;
    cancelled_reservations: number;
    no_shows: number;
    average_party_size: number;
    peak_hours: { hour: string; count: number }[];
  }> {
    const stats = await db('reservations')
      .where('restaurant_id', restaurantId)
      .where('reservation_date', '>=', startDate)
      .where('reservation_date', '<=', endDate)
      .select(
        db.raw('COUNT(*) as total_reservations'),
        db.raw('SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed_reservations'),
        db.raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_reservations'),
        db.raw('SUM(CASE WHEN status = "no_show" THEN 1 ELSE 0 END) as no_shows'),
        db.raw('AVG(party_size) as average_party_size')
      )
      .first();

    // Get peak hours
    const peakHours = await db('reservations')
      .where('restaurant_id', restaurantId)
      .where('reservation_date', '>=', startDate)
      .where('reservation_date', '<=', endDate)
      .whereIn('status', ['confirmed', 'seated', 'completed'])
      .select(
        db.raw('substr(reservation_time, 1, 2) as hour'),
        db.raw('COUNT(*) as count')
      )
      .groupBy('hour')
      .orderBy('count', 'desc')
      .limit(5);

    return {
      ...stats,
      peak_hours: peakHours
    };
  }
}

export default new ReservationService();