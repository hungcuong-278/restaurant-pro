import api from './api';

// Restaurant interfaces
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  imageUrl?: string;
  cuisineType: string;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  rating: number;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  userId: string;
  date: string;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
}

// Restaurant API functions
export const restaurantService = {
  // Get all restaurants
  getRestaurants: async (params?: {
    search?: string;
    cuisineType?: string;
    priceRange?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    restaurants: Restaurant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  // Get restaurant by ID
  getRestaurant: async (id: string): Promise<{
    success: boolean;
    restaurant: Restaurant;
  }> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId: string): Promise<{
    success: boolean;
    menuItems: MenuItem[];
  }> => {
    const response = await api.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  },

  // Create restaurant (admin only)
  createRestaurant: async (restaurantData: Omit<Restaurant, 'id' | 'rating' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    restaurant: Restaurant;
  }> => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  },

  // Update restaurant (admin/manager only)
  updateRestaurant: async (id: string, restaurantData: Partial<Restaurant>): Promise<{
    success: boolean;
    restaurant: Restaurant;
  }> => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  // Delete restaurant (admin only)
  deleteRestaurant: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },
};

// Menu API functions
export const menuService = {
  // Get menu items
  getMenuItems: async (restaurantId: string, params?: {
    category?: string;
    search?: string;
    available?: boolean;
  }): Promise<{
    success: boolean;
    menuItems: MenuItem[];
  }> => {
    const response = await api.get(`/restaurants/${restaurantId}/menu`, { params });
    return response.data;
  },

  // Create menu item
  createMenuItem: async (restaurantId: string, menuData: Omit<MenuItem, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    menuItem: MenuItem;
  }> => {
    const response = await api.post(`/restaurants/${restaurantId}/menu`, menuData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (restaurantId: string, itemId: string, menuData: Partial<MenuItem>): Promise<{
    success: boolean;
    menuItem: MenuItem;
  }> => {
    const response = await api.put(`/restaurants/${restaurantId}/menu/${itemId}`, menuData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (restaurantId: string, itemId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
    return response.data;
  },
};

// Reservation API functions
export const reservationService = {
  // Create reservation
  createReservation: async (reservationData: {
    restaurantId: string;
    date: string;
    time: string;
    partySize: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests?: string;
  }): Promise<{
    success: boolean;
    reservation: Reservation;
  }> => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  // Get user reservations
  getUserReservations: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    reservations: Reservation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get('/reservations/my', { params });
    return response.data;
  },

  // Get reservation by ID
  getReservation: async (id: string): Promise<{
    success: boolean;
    reservation: Reservation;
  }> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Update reservation
  updateReservation: async (id: string, reservationData: Partial<Reservation>): Promise<{
    success: boolean;
    reservation: Reservation;
  }> => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  // Cancel reservation
  cancelReservation: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.put(`/reservations/${id}/cancel`);
    return response.data;
  },

  // Get restaurant reservations (staff/manager/admin)
  getRestaurantReservations: async (restaurantId: string, params?: {
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    reservations: Reservation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get(`/restaurants/${restaurantId}/reservations`, { params });
    return response.data;
  },
};