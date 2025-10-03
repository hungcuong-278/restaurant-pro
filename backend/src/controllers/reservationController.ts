import { Request, Response } from 'express';
import reservationService, { ReservationFilters } from '../services/reservationService';
import emailService from '../services/emailService';

export class ReservationController {
  // Get reservations with filtering
  async getReservations(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const filters: ReservationFilters = {
        date: req.query.date as string,
        status: req.query.status as string,
        table_id: req.query.table_id as string,
        customer_email: req.query.customer_email as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await reservationService.getReservations(restaurantId, filters);
      
      res.json({
        success: true,
        data: result.reservations,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: result.total,
          pages: Math.ceil(result.total / (filters.limit || 10))
        }
      });
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single reservation
  async getReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      
      const reservation = await reservationService.getReservationById(id, restaurantId);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Error getting reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create reservation
  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const reservationData = {
        ...req.body,
        restaurant_id: restaurantId,
        status: req.body.status || 'pending'
      };

      // Validate required fields
      const requiredFields = ['customer_name', 'customer_email', 'party_size', 'reservation_date', 'reservation_time'];
      const missingFields = requiredFields.filter(field => !reservationData[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }

      // Validate party size
      if (reservationData.party_size < 1 || reservationData.party_size > 20) {
        res.status(400).json({
          success: false,
          message: 'Party size must be between 1 and 20'
        });
        return;
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(reservationData.reservation_date)) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
        return;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reservationData.reservation_time)) {
        res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:MM'
        });
        return;
      }

      const reservation = await reservationService.createReservation(reservationData);
      
      // Send confirmation email
      try {
        const emailResult = await emailService.sendReservationConfirmation({
          customerName: reservation.customer_name,
          customerEmail: reservation.customer_email,
          reservationDate: reservation.reservation_date,
          reservationTime: reservation.reservation_time,
          partySize: reservation.party_size,
          tableNumber: reservation.table?.number || 'TBD',
          confirmationCode: reservation.id.substring(0, 8).toUpperCase(),
          restaurantName: 'Golden Fork Restaurant',
          restaurantPhone: '+1 (555) 123-4567',
          restaurantEmail: 'info@goldenfork.com',
        });

        if (emailResult.success) {
          console.log('[ReservationController] Confirmation email sent successfully');
          if (emailResult.previewUrl) {
            console.log('[ReservationController] Email preview:', emailResult.previewUrl);
          }
        } else {
          console.error('[ReservationController] Failed to send confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        // Don't fail the reservation if email fails
        console.error('[ReservationController] Email sending error:', emailError);
      }
      
      res.status(201).json({
        success: true,
        data: reservation,
        message: 'Reservation created successfully'
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      
      if (error instanceof Error && error.message.includes('not available')) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update reservation
  async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      
      const reservation = await reservationService.updateReservation(id, restaurantId, req.body);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: reservation,
        message: 'Reservation updated successfully'
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      
      if (error instanceof Error && error.message.includes('not available')) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cancel reservation
  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      
      const success = await reservationService.cancelReservation(id, restaurantId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Check availability
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const { date, time, table_id } = req.query;

      if (!date || !time) {
        res.status(400).json({
          success: false,
          message: 'Date and time are required'
        });
        return;
      }

      const available = await reservationService.checkAvailability(
        restaurantId,
        date as string,
        time as string,
        table_id as string
      );

      res.json({
        success: true,
        data: { available }
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get available time slots
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const { date, party_size, duration } = req.query;

      if (!date || !party_size) {
        res.status(400).json({
          success: false,
          message: 'Date and party_size are required'
        });
        return;
      }

      const partySize = parseInt(party_size as string);
      const reservationDuration = duration ? parseInt(duration as string) : 120;

      if (partySize < 1 || partySize > 20) {
        res.status(400).json({
          success: false,
          message: 'Party size must be between 1 and 20'
        });
        return;
      }

      const slots = await reservationService.getAvailableSlots(
        restaurantId,
        date as string,
        partySize,
        reservationDuration
      );

      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      console.error('Error getting available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available slots',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Confirm reservation
  async confirmReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      const { confirmed_by } = req.body;

      if (!confirmed_by) {
        res.status(400).json({
          success: false,
          message: 'confirmed_by is required'
        });
        return;
      }

      const reservation = await reservationService.confirmReservation(id, restaurantId, confirmed_by);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: reservation,
        message: 'Reservation confirmed successfully'
      });
    } catch (error) {
      console.error('Error confirming reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Seat reservation
  async seatReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      
      const reservation = await reservationService.seatReservation(id, restaurantId);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: reservation,
        message: 'Customer seated successfully'
      });
    } catch (error) {
      console.error('Error seating reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seat reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Complete reservation
  async completeReservation(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, id } = req.params;
      
      const reservation = await reservationService.completeReservation(id, restaurantId);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: reservation,
        message: 'Reservation completed successfully'
      });
    } catch (error) {
      console.error('Error completing reservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete reservation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get reservations by date
  async getReservationsByDate(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, date } = req.params;
      
      const reservations = await reservationService.getReservationsByDate(restaurantId, date);
      
      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error getting reservations by date:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get reservation calendar
  async getReservationCalendar(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          message: 'start_date and end_date are required'
        });
        return;
      }

      const calendar = await reservationService.getReservationCalendar(
        restaurantId,
        start_date as string,
        end_date as string
      );
      
      res.json({
        success: true,
        data: calendar
      });
    } catch (error) {
      console.error('Error getting reservation calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservation calendar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get reservation statistics
  async getReservationStats(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          message: 'start_date and end_date are required'
        });
        return;
      }

      const stats = await reservationService.getReservationStats(
        restaurantId,
        start_date as string,
        end_date as string
      );
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting reservation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reservation stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new ReservationController();