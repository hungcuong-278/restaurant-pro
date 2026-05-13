import { Request, Response, NextFunction } from 'express';

// Middleware to inject default restaurant ID for single-restaurant setup
// This allows controllers designed for multi-restaurant to work in single-restaurant mode
export const injectRestaurantId = (req: Request, res: Response, next: NextFunction) => {
  // If route doesn't have restaurantId param, inject default
  if (!req.params.restaurantId) {
    // Use a fixed UUID for the single restaurant
    req.params.restaurantId = '00000000-0000-0000-0000-000000000001';
    console.log(`[InjectRestaurantId] Injected default restaurant ID for ${req.method} ${req.path}`);
  } else {
    console.log(`[InjectRestaurantId] Restaurant ID already exists: ${req.params.restaurantId}`);
  }
  next();
};
