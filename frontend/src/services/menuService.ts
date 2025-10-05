import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  category: string;
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
      if (filters?.category) params.append('category', filters.category);
      if (filters?.is_available !== undefined) params.append('is_available', filters.is_available.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu-items${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // Get single menu item
  async getMenuItem(itemId: string): Promise<MenuItem> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu-items/${itemId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  // Create menu item
  async createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu-items`,
        itemData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Update menu item
  async updateMenuItem(itemId: string, itemData: UpdateMenuItemData): Promise<MenuItem> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu-items/${itemId}`,
        itemData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete menu item
  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu-items/${itemId}`
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
      const categories = Array.from(new Set(items.map(item => item.category)));
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
