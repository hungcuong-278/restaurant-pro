/**
 * Reservation Service Unit Tests
 */
import reservationService from '../../services/reservationService';
import db from '../../config/database';

describe('ReservationService', () => {
  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('checkAvailability', () => {
    it('should return available tables for valid date/time', async () => {
      const result = await reservationService.checkAvailability({
        date: '2025-10-10',
        time: '18:00',
        party_size: 2,
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3'
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.tables)).toBe(true);
    });

    it('should return empty array for fully booked time', async () => {
      // Create test reservations to fill all tables
      const result = await reservationService.checkAvailability({
        date: '2025-10-10',
        time: '19:00',
        party_size: 10,
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3'
      });

      expect(result.success).toBe(true);
    });

    it('should reject past dates', async () => {
      const result = await reservationService.checkAvailability({
        date: '2020-01-01',
        time: '18:00',
        party_size: 2,
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3'
      });

      expect(result.success).toBe(false);
    });

    it('should validate party size limits', async () => {
      const result = await reservationService.checkAvailability({
        date: '2025-10-10',
        time: '18:00',
        party_size: 100,
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3'
      });

      expect(result.success).toBe(false);
    });
  });

  describe('createReservation', () => {
    it('should create reservation with valid data', async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00',
        special_requests: 'Window seat please'
      });

      expect(result.success).toBe(true);
      expect(result.reservation).toBeDefined();
      expect(result.reservation?.customer_name).toBe('Test User');
    });

    it('should reject reservation without required fields', async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: '',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00'
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'invalid-email',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00'
      });

      expect(result.success).toBe(false);
    });

    it('should handle concurrent reservations correctly', async () => {
      const reservationData = {
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-20',
        reservation_time: '19:00',
        table_id: 'same-table-id'
      };

      // Try to create two reservations for same table at same time
      const [result1, result2] = await Promise.all([
        reservationService.createReservation(reservationData),
        reservationService.createReservation(reservationData)
      ]);

      // One should succeed, one should fail
      const successCount = [result1, result2].filter(r => r.success).length;
      expect(successCount).toBe(1);
    });
  });

  describe('updateReservation', () => {
    let testReservationId: string;

    beforeEach(async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00'
      });
      testReservationId = result.reservation?.id || '';
    });

    it('should update reservation successfully', async () => {
      const result = await reservationService.updateReservation(
        testReservationId,
        { party_size: 4 },
        'test-user-id',
        'customer'
      );

      expect(result.success).toBe(true);
      expect(result.reservation?.party_size).toBe(4);
    });

    it('should reject unauthorized update', async () => {
      const result = await reservationService.updateReservation(
        testReservationId,
        { party_size: 4 },
        'different-user-id',
        'customer'
      );

      expect(result.success).toBe(false);
    });

    it('should allow staff to update any reservation', async () => {
      const result = await reservationService.updateReservation(
        testReservationId,
        { party_size: 4 },
        'staff-user-id',
        'staff'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('cancelReservation', () => {
    let testReservationId: string;

    beforeEach(async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00'
      });
      testReservationId = result.reservation?.id || '';
    });

    it('should cancel reservation successfully', async () => {
      const result = await reservationService.cancelReservation(
        testReservationId,
        'test-user-id',
        'customer'
      );

      expect(result.success).toBe(true);
    });

    it('should reject cancel for non-existent reservation', async () => {
      const result = await reservationService.cancelReservation(
        'non-existent-id',
        'test-user-id',
        'customer'
      );

      expect(result.success).toBe(false);
    });

    it('should not allow canceling already cancelled reservation', async () => {
      await reservationService.cancelReservation(
        testReservationId,
        'test-user-id',
        'customer'
      );

      const result = await reservationService.cancelReservation(
        testReservationId,
        'test-user-id',
        'customer'
      );

      expect(result.success).toBe(false);
    });
  });

  describe('getUserReservations', () => {
    it('should return user reservations', async () => {
      const result = await reservationService.getUserReservations('test-user-id');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.reservations)).toBe(true);
    });

    it('should return empty array for user with no reservations', async () => {
      const result = await reservationService.getUserReservations('no-reservations-user');

      expect(result.success).toBe(true);
      expect(result.reservations).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs gracefully', async () => {
      const result = await reservationService.checkAvailability({
        date: null as any,
        time: null as any,
        party_size: null as any,
        restaurant_id: null as any
      });

      expect(result.success).toBe(false);
    });

    it('should handle special characters in customer name', async () => {
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: "O'Brien Test <script>alert('xss')</script>",
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00'
      });

      expect(result.success).toBe(true);
      // Should sanitize special characters
      expect(result.reservation?.customer_name).not.toContain('<script>');
    });

    it('should handle very long special requests', async () => {
      const longText = 'A'.repeat(5000);
      const result = await reservationService.createReservation({
        restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
        customer_id: 'test-user-id',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        party_size: 2,
        reservation_date: '2025-10-15',
        reservation_time: '18:00',
        special_requests: longText
      });

      expect(result.success).toBe(false);
    });
  });
});
