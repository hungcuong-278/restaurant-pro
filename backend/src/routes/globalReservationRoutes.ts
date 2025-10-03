/**
 * Global Reservation Routes
 * 
 * Routes for accessing reservations without restaurant context.
 * Used for confirmation pages and email links where restaurant ID is unknown.
 */

import { Router } from 'express';
import { Request, Response } from 'express';
import reservationService from '../services/reservationService';

const router = Router();

// Get single reservation by ID (without restaurant context)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Query database directly to find reservation with its restaurant_id
    const db = require('../config/database').default;
    const reservation = await db('reservations')
      .leftJoin('tables', 'reservations.table_id', 'tables.id')
      .select(
        'reservations.*',
        'tables.number as table_number',
        'tables.capacity as table_capacity',
        'tables.location as table_location'
      )
      .where('reservations.id', id)
      .first();

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    // Format response with table info
    const formattedReservation = {
      ...reservation,
      table: reservation.table_number ? {
        number: reservation.table_number,
        capacity: reservation.table_capacity,
        location: reservation.table_location
      } : null
    };

    res.json({
      success: true,
      data: formattedReservation
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
