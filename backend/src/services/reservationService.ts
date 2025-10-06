import db from '../config/database';

interface CreateReservationData {
  restaurant_id?: string;
  table_id?: string | null;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
}

interface UpdateReservationData {
  table_id?: string | null;
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  status?: string;
  special_requests?: string;
  notes?: string;
}

interface GetAllReservationsParams {
  status?: string;
  date?: string;
  limit?: number;
  offset?: number;
}

interface CheckAvailabilityParams {
  date: string;
  time: string;
  party_size: number;
  restaurant_id?: string;
}

class ReservationService {
  /**
   * Create new reservation
   */
  async createReservation(data: CreateReservationData) {
    try {
      // Validate reservation date (must be in future)
      const reservationDateTime = new Date(`${data.reservation_date}T${data.reservation_time}`);
      const now = new Date();
      
      if (reservationDateTime <= now) {
        return {
          success: false,
          message: 'Reservation must be for a future date and time'
        };
      }

      // Get default restaurant if not provided
      let restaurantId = data.restaurant_id;
      if (!restaurantId) {
        const defaultRestaurant = await db('restaurants').first();
        restaurantId = defaultRestaurant?.id;
      }

      // Check if table is available (if table_id provided)
      if (data.table_id) {
        const isAvailable = await this.isTableAvailable(
          data.table_id,
          data.reservation_date,
          data.reservation_time
        );

        if (!isAvailable) {
          return {
            success: false,
            message: 'Selected table is not available at this time. Please choose a different time or table.'
          };
        }
      }

      // Create reservation
      const [reservationId] = await db('reservations').insert({
        restaurant_id: restaurantId,
        table_id: data.table_id || null,
        customer_id: data.customer_id,
        customer_name: data.customer_name.trim(),
        customer_email: data.customer_email.toLowerCase().trim(),
        customer_phone: data.customer_phone?.trim() || null,
        party_size: data.party_size,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        status: 'pending',
        special_requests: data.special_requests?.trim() || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Fetch created reservation with table info
      const reservation = await db('reservations')
        .leftJoin('tables', 'reservations.table_id', 'tables.id')
        .where('reservations.id', reservationId)
        .select(
          'reservations.*',
          'tables.table_number',
          'tables.capacity',
          'tables.location'
        )
        .first();

      return {
        success: true,
        message: 'Reservation created successfully',
        reservation
      };

    } catch (error) {
      console.error('Create reservation service error:', error);
      return {
        success: false,
        message: 'Failed to create reservation'
      };
    }
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(userId: string) {
    try {
      const reservations = await db('reservations')
        .leftJoin('tables', 'reservations.table_id', 'tables.id')
        .leftJoin('restaurants', 'reservations.restaurant_id', 'restaurants.id')
        .where('reservations.customer_id', userId)
        .orderBy('reservations.reservation_date', 'desc')
        .orderBy('reservations.reservation_time', 'desc')
        .select(
          'reservations.*',
          'tables.table_number',
          'tables.capacity',
          'tables.location',
          'restaurants.name as restaurant_name'
        );

      return {
        success: true,
        reservations,
        count: reservations.length
      };

    } catch (error) {
      console.error('Get user reservations error:', error);
      return {
        success: false,
        message: 'Failed to fetch reservations'
      };
    }
  }

  /**
   * Get all reservations (admin/staff)
   */
  async getAllReservations(params: GetAllReservationsParams) {
    try {
      let query = db('reservations')
        .leftJoin('tables', 'reservations.table_id', 'tables.id')
        .leftJoin('restaurants', 'reservations.restaurant_id', 'restaurants.id')
        .leftJoin('users', 'reservations.customer_id', 'users.id');

      // Apply filters
      if (params.status) {
        query = query.where('reservations.status', params.status);
      }

      if (params.date) {
        query = query.where('reservations.reservation_date', params.date);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('* as count');

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.offset(params.offset);
      }

      // Fetch reservations
      const reservations = await query
        .orderBy('reservations.reservation_date', 'desc')
        .orderBy('reservations.reservation_time', 'desc')
        .select(
          'reservations.*',
          'tables.table_number',
          'tables.capacity',
          'tables.location',
          'restaurants.name as restaurant_name',
          'users.first_name',
          'users.last_name'
        );

      return {
        success: true,
        reservations,
        count: parseInt(count as string),
        limit: params.limit,
        offset: params.offset
      };

    } catch (error) {
      console.error('Get all reservations error:', error);
      return {
        success: false,
        message: 'Failed to fetch reservations'
      };
    }
  }

  /**
   * Get single reservation by ID
   */
  async getReservationById(id: string, userId: string, userRole?: string) {
    try {
      const reservation = await db('reservations')
        .leftJoin('tables', 'reservations.table_id', 'tables.id')
        .leftJoin('restaurants', 'reservations.restaurant_id', 'restaurants.id')
        .where('reservations.id', id)
        .select(
          'reservations.*',
          'tables.table_number',
          'tables.capacity',
          'tables.location',
          'restaurants.name as restaurant_name'
        )
        .first();

      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      // Check access rights (customer can only see their own reservations)
      if (userRole !== 'staff' && userRole !== 'admin' && reservation.customer_id !== userId) {
        return {
          success: false,
          message: 'Access denied'
        };
      }

      return {
        success: true,
        reservation
      };

    } catch (error) {
      console.error('Get reservation by ID error:', error);
      return {
        success: false,
        message: 'Failed to fetch reservation'
      };
    }
  }

  /**
   * Update reservation
   */
  async updateReservation(id: string, data: UpdateReservationData, userId: string, userRole?: string) {
    try {
      // Check if reservation exists
      const reservation = await db('reservations').where('id', id).first();

      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      // Check access rights
      const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';
      const isOwner = reservation.customer_id === userId;

      if (!isStaffOrAdmin && !isOwner) {
        return {
          success: false,
          message: 'Access denied'
        };
      }

      // Customers can only update certain fields and only if reservation is pending
      if (!isStaffOrAdmin) {
        if (reservation.status !== 'pending') {
          return {
            success: false,
            message: 'Cannot modify reservation after it has been confirmed'
          };
        }

        // Customers cannot change status
        if (data.status) {
          delete data.status;
        }
      }

      // Validate new reservation time if provided
      if (data.reservation_date && data.reservation_time) {
        const reservationDateTime = new Date(`${data.reservation_date}T${data.reservation_time}`);
        const now = new Date();
        
        if (reservationDateTime <= now) {
          return {
            success: false,
            message: 'Reservation must be for a future date and time'
          };
        }
      }

      // Check table availability if table changed
      if (data.table_id && data.table_id !== reservation.table_id) {
        const isAvailable = await this.isTableAvailable(
          data.table_id,
          data.reservation_date || reservation.reservation_date,
          data.reservation_time || reservation.reservation_time,
          id // Exclude current reservation
        );

        if (!isAvailable) {
          return {
            success: false,
            message: 'Selected table is not available at this time'
          };
        }
      }

      // Update reservation
      await db('reservations')
        .where('id', id)
        .update({
          ...data,
          updated_at: new Date(),
          ...(data.status === 'confirmed' && !reservation.confirmed_at ? {
            confirmed_at: new Date(),
            confirmed_by: userId
          } : {})
        });

      // Fetch updated reservation
      const updatedReservation = await db('reservations')
        .leftJoin('tables', 'reservations.table_id', 'tables.id')
        .where('reservations.id', id)
        .select(
          'reservations.*',
          'tables.table_number',
          'tables.capacity',
          'tables.location'
        )
        .first();

      return {
        success: true,
        message: 'Reservation updated successfully',
        reservation: updatedReservation
      };

    } catch (error) {
      console.error('Update reservation error:', error);
      return {
        success: false,
        message: 'Failed to update reservation'
      };
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(id: string, userId: string, userRole?: string) {
    try {
      const reservation = await db('reservations').where('id', id).first();

      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      // Check access rights
      const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';
      const isOwner = reservation.customer_id === userId;

      if (!isStaffOrAdmin && !isOwner) {
        return {
          success: false,
          message: 'Access denied'
        };
      }

      // Check if already cancelled
      if (reservation.status === 'cancelled') {
        return {
          success: false,
          message: 'Reservation is already cancelled'
        };
      }

      // Check if already completed
      if (reservation.status === 'completed') {
        return {
          success: false,
          message: 'Cannot cancel completed reservation'
        };
      }

      // Cancel reservation
      await db('reservations')
        .where('id', id)
        .update({
          status: 'cancelled',
          updated_at: new Date()
        });

      return {
        success: true,
        message: 'Reservation cancelled successfully'
      };

    } catch (error) {
      console.error('Cancel reservation error:', error);
      return {
        success: false,
        message: 'Failed to cancel reservation'
      };
    }
  }

  /**
   * Check table availability
   */
  async checkAvailability(params: CheckAvailabilityParams) {
    try {
      // Get default restaurant if not provided
      let restaurantId = params.restaurant_id;
      if (!restaurantId) {
        const defaultRestaurant = await db('restaurants').first();
        restaurantId = defaultRestaurant?.id;
      }

      // Get all tables that can accommodate the party size
      const availableTables = await db('tables')
        .where('restaurant_id', restaurantId)
        .where('capacity', '>=', params.party_size)
        .where('is_available', true)
        .whereNotExists(function() {
          this.select('*')
            .from('reservations')
            .whereRaw('reservations.table_id = tables.id')
            .where('reservation_date', params.date)
            .where('reservation_time', params.time)
            .whereIn('status', ['pending', 'confirmed', 'seated']);
        })
        .orderBy('capacity', 'asc')
        .select('*');

      return {
        success: true,
        available: availableTables.length > 0,
        tables: availableTables,
        count: availableTables.length
      };

    } catch (error) {
      console.error('Check availability error:', error);
      return {
        success: false,
        message: 'Failed to check availability'
      };
    }
  }

  /**
   * Check if specific table is available
   */
  private async isTableAvailable(
    tableId: string,
    date: string,
    time: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    try {
      let query = db('reservations')
        .where('table_id', tableId)
        .where('reservation_date', date)
        .where('reservation_time', time)
        .whereIn('status', ['pending', 'confirmed', 'seated']);

      if (excludeReservationId) {
        query = query.whereNot('id', excludeReservationId);
      }

      const existingReservation = await query.first();

      return !existingReservation;

    } catch (error) {
      console.error('Check table availability error:', error);
      return false;
    }
  }
}

export default new ReservationService();
