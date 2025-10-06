import express from 'express';
import reservationController from '../controllers/reservationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/reservations
 * @desc    Create new reservation
 * @access  Private (authenticated users)
 */
router.post('/', reservationController.createReservation);

/**
 * @route   GET /api/reservations/my
 * @desc    Get current user's reservations
 * @access  Private (authenticated users)
 */
router.get('/my', reservationController.getMyReservations);

/**
 * @route   GET /api/reservations/available-tables
 * @desc    Check table availability
 * @access  Private (authenticated users)
 */
router.get('/available-tables', reservationController.checkAvailability);

/**
 * @route   GET /api/reservations
 * @desc    Get all reservations (with filters)
 * @access  Private (staff/admin only)
 */
router.get('/', reservationController.getAllReservations);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get single reservation by ID
 * @access  Private (owner or staff/admin)
 */
router.get('/:id', reservationController.getReservationById);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Update reservation
 * @access  Private (owner or staff/admin)
 */
router.put('/:id', reservationController.updateReservation);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Cancel reservation
 * @access  Private (owner or staff/admin)
 */
router.delete('/:id', reservationController.cancelReservation);

export default router;
