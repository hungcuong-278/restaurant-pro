import request from 'supertest';
import app from '../app';

describe('notFound middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return fallback HTML for reservation routes in development', async () => {
    const response = await request(app).get('/reservations');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Reservation Form');
    expect(response.text).toContain('Review &');
  });

  it('should respond with JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatchObject({
      code: 'ROUTE_NOT_FOUND',
    });
  });
});