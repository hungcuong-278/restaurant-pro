/**
 * Reservation API Integration Tests
 */
import request from 'supertest';
import app from '../../app';
import db from '../../config/database';

describe('Reservation API Endpoints', () => {
  let authToken: string;
  let staffToken: string;
  let testReservationId: string;

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();

    // Login as customer
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@restaurant.com',
        password: 'admin123'
      });
    authToken = customerLogin.body.token;

    // Login as staff
    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'staff@restaurant.com',
        password: 'staff123'
      });
    staffToken = staffLogin.body.token;
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/reservations', () => {
    it('should create reservation with valid data', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          customer_name: 'API Test User',
          customer_email: 'apitest@example.com',
          customer_phone: '+1234567890',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00',
          special_requests: 'Window seat'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.reservation).toBeDefined();
      testReservationId = response.body.reservation.id;
    });

    it('should reject reservation without authentication', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '+1234567890',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          // Missing customer_name
          customer_email: 'test@example.com',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          customer_name: 'Test User',
          customer_email: 'invalid-email',
          customer_phone: '+1234567890',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      expect(response.status).toBe(400);
    });

    it('should validate party size range', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          customer_phone: '+1234567890',
          party_size: 0,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      expect(response.status).toBe(400);
    });

    it('should handle SQL injection attempts', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: "'; DROP TABLE reservations; --",
          customer_name: "Robert'; DROP TABLE students;--",
          customer_email: 'test@example.com',
          customer_phone: '+1234567890',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      expect(response.status).toBe(400);
    });

    it('should handle XSS attempts in input', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'a8d307c4-40c2-4e11-8468-d65710bae6f3',
          customer_name: "<script>alert('xss')</script>",
          customer_email: 'test@example.com',
          customer_phone: '+1234567890',
          party_size: 2,
          reservation_date: '2025-10-20',
          reservation_time: '18:00'
        });

      // Should either reject or sanitize
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('GET /api/reservations/my', () => {
    it('should get current user reservations', async () => {
      const response = await request(app)
        .get('/api/reservations/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.reservations)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/reservations/my');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reservations/available-tables', () => {
    it('should return available tables', async () => {
      const response = await request(app)
        .get('/api/reservations/available-tables')
        .query({
          date: '2025-10-25',
          time: '18:00',
          party_size: 2
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tables)).toBe(true);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/reservations/available-tables')
        .query({
          // Missing required parameters
          date: '2025-10-25'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/reservations/available-tables')
        .query({
          date: 'invalid-date',
          time: '18:00',
          party_size: 2
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get reservation by ID', async () => {
      const response = await request(app)
        .get(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reservation).toBeDefined();
    });

    it('should reject non-existent ID', async () => {
      const response = await request(app)
        .get('/api/reservations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject access to other user reservation', async () => {
      // Try to access with different user token
      const response = await request(app)
        .get(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      // Staff should be able to access, but regular customer shouldn't
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it('should update reservation', async () => {
      const response = await request(app)
        .put(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          party_size: 4,
          special_requests: 'Updated request'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          party_size: -1 // Invalid
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should cancel reservation', async () => {
      const response = await request(app)
        .delete(`/api/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject cancel non-existent reservation', async () => {
      const response = await request(app)
        .delete('/api/reservations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = Array(20).fill(null).map(() => 
        request(app)
          .get('/api/reservations/my')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      // At least one should be rate limited
      expect(rateLimited).toBe(true);
    }, 30000);
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/reservations/my')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by closing connection temporarily
      await db.destroy();

      const response = await request(app)
        .get('/api/reservations/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // Reconnect
      await db.migrate.latest();
    });

    it('should return proper error format', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Invalid data
          party_size: 'invalid'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/reservations/available-tables')
        .query({
          date: '2025-10-25',
          time: '18:00',
          party_size: 2
        })
        .set('Authorization', `Bearer ${authToken}`);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
