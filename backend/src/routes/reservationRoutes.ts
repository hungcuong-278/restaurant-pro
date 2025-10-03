import { Router } from 'express';
import reservationController from '../controllers/reservationController';

const router = Router({ mergeParams: true });

// Base route: /api/restaurants/:restaurantId/reservations

// Get all reservations with filtering
router.get('/', reservationController.getReservations);

// Get available time slots for a date
router.get('/availability/slots', reservationController.getAvailableSlots);

// Check availability for specific time/table
router.get('/availability/check', reservationController.checkAvailability);

// Get reservations by specific date
router.get('/date/:date', reservationController.getReservationsByDate);

// Get reservation calendar for date range
router.get('/calendar', reservationController.getReservationCalendar);

// Get reservation statistics
router.get('/stats', reservationController.getReservationStats);

// Get single reservation
router.get('/:id', reservationController.getReservation);

// Create new reservation
router.post('/', reservationController.createReservation);

// Update reservation
router.put('/:id', reservationController.updateReservation);

// Cancel reservation
router.delete('/:id', reservationController.cancelReservation);

// Confirm reservation
router.patch('/:id/confirm', reservationController.confirmReservation);

// Seat reservation (mark as seated)
router.patch('/:id/seat', reservationController.seatReservation);

// Complete reservation
router.patch('/:id/complete', reservationController.completeReservation);

export default router;