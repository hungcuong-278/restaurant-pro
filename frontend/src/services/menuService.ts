import axios from 'axios';
import { RESTAURANT_ID } from '../config/restaurant';

const API_BASE_URL = 'http://localhost:5000/api';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  category: string | { name: string; slug: string };  // Backend returns object, but accept string for compatibility
  category_name?: string;  // Direct category name from backend
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured?: boolean;
  dietary_info?: string[];
  allergens?: string[];
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time?: number;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time?: number;
}

export interface MenuFilters {
  category?: string;
  is_available?: boolean;
  search?: string;
}

// Stub type for Redux compatibility (not used in Phase 3)
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const menuService = {
  // Get all menu items
  async getMenuItems(filters?: MenuFilters): Promise<MenuItem[]> {
    try {
      const params = new URLSearchParams();
      // Always include restaurant_id
      params.append('restaurant_id', RESTAURANT_ID);
      // Add high limit to get all items
      params.append('limit', '100');
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.is_available !== undefined) params.append('available', filters.is_available.toString());
      if (filters?.search) params.append('search', filters.search);

      const url = `${API_BASE_URL}/menu/items?${params.toString()}`;
      
      const response = await axios.get(url);
      // Backend returns { success: true, data: { items: [...], pagination: {...} } }
      const data = response.data.data || response.data;
      // Extract items array from nested structure
      return data.items || data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // Get single menu item
  async getMenuItem(itemId: string): Promise<MenuItem> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/menu/items/${itemId}`
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  // Create menu item
  async createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/menu/items`,
        itemData
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Update menu item
  async updateMenuItem(itemId: string, itemData: UpdateMenuItemData): Promise<MenuItem> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/menu/items/${itemId}`,
        itemData
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete menu item
  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/menu/items/${itemId}`
      );
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  // Get available menu items
  async getAvailableMenuItems(category?: string): Promise<MenuItem[]> {
    return this.getMenuItems({ is_available: true, category });
  },

  // Get menu categories
  async getCategories(): Promise<string[]> {
    try {
      const items = await this.getMenuItems();
      // Extract category name from either string or object, with null safety
      const categories = Array.from(new Set(
        items
          .map(item => {
            if (!item.category) return null;
            return typeof item.category === 'string' ? item.category : item.category.name;
          })
          .filter((cat): cat is string => cat !== null)
      ));
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Stub methods for Redux compatibility (not fully implemented in Phase 3)
  async getFullMenu(): Promise<any> {
    return this.getMenuItems();
  },

  async getFeaturedItems(limit: number = 6): Promise<MenuItem[]> {
    const items = await this.getMenuItems({ is_available: true });
    return items.filter(item => item.is_featured).slice(0, limit);
  },

  async createCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    throw new Error('Category management not implemented');
  },

  async updateCategory(id: string, updates: Partial<MenuCategory>): Promise<MenuCategory> {
    throw new Error('Category management not implemented');
  },

  async deleteCategory(id: string): Promise<void> {
    throw new Error('Category management not implemented');
  },

  async toggleItemAvailability(id: string): Promise<MenuItem> {
    return this.updateMenuItem(id, { is_available: true });
  },
};

export default menuService;
