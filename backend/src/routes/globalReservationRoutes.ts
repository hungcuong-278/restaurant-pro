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

    // First, get the reservation to find its restaurant
    const reservations = await reservationService.getReservations('', {});
    const reservation = reservations.reservations.find(r => r.id === id);

    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
      return;
    }

    // Now fetch full details with restaurant context
    const fullReservation = await reservationService.getReservationById(
      id,
      reservation.restaurant_id
    );

    res.json({
      success: true,
      data: fullReservation
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
