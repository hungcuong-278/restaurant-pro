import { Router, Request, Response } from 'express';

const router = Router();

// User registration
router.post('/register', (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role = 'customer' } = req.body;
  
  // Mock registration for testing
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Simulate user creation
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      role
    },
    token: `mock-jwt-token-${Date.now()}`
  });
});

// User login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Mock authentication for testing
  if (email === 'admin@restaurant.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '1',
        firstName: 'Gordon',
        lastName: 'Ramsay',
        email: 'admin@restaurant.com',
        role: 'admin'
      },
      token: 'mock-jwt-token-123456789'
    });
  } else if (email === 'chef@restaurant.com' && password === 'chef123') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '2',
        firstName: 'Jamie',
        lastName: 'Oliver',
        email: 'chef@restaurant.com',
        role: 'manager'
      },
      token: 'mock-jwt-token-987654321'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Password reset request
router.post('/forgot-password', (req: Request, res: Response) => {
  // TODO: Implement password reset
  res.json({
    success: true,
    message: 'Password reset endpoint - Coming soon'
  });
});

// Get current user profile
router.get('/profile', (req: Request, res: Response) => {
  // TODO: Implement profile retrieval (requires auth middleware)
  res.json({
    success: true,
    message: 'User profile endpoint - Coming soon'
  });
});

export default router;