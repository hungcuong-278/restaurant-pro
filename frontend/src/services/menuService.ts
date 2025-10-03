import api from './api';

// Menu interfaces matching backend
export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  cost?: number;
  image_url?: string;
  allergens?: string[];
  dietary_info?: string[];
  preparation_time?: number;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export interface MenuFilters {
  categoryId?: string;
  available?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface MenuResponse {
  items: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class MenuService {
  // Categories
  async getCategories(): Promise<MenuCategory[]> {
    try {
      const response = await api.get<APIResponse<MenuCategory[]>>('/menu/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<MenuCategory> {
    try {
      const response = await api.get<APIResponse<MenuCategory>>(`/menu/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async createCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    try {
      const response = await api.post<APIResponse<MenuCategory>>('/menu/categories', category);
      return response.data.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<MenuCategory>): Promise<MenuCategory> {
    try {
      const response = await api.put<APIResponse<MenuCategory>>(`/menu/categories/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/menu/categories/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Menu Items
  async getMenuItems(filters: MenuFilters = {}): Promise<MenuResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.categoryId) params.append('category_id', filters.categoryId);
      if (typeof filters.available === 'boolean') params.append('available', filters.available.toString());
      if (typeof filters.featured === 'boolean') params.append('featured', filters.featured.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<APIResponse<MenuResponse>>(`/menu/items?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    try {
      const response = await api.get<APIResponse<MenuItem>>(`/menu/items/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }

  async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<MenuItem> {
    try {
      const response = await api.post<APIResponse<MenuItem>>('/menu/items', item);
      return response.data.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const response = await api.put<APIResponse<MenuItem>>(`/menu/items/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      await api.delete(`/menu/items/${id}`);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  async toggleItemAvailability(id: string): Promise<MenuItem> {
    try {
      const response = await api.patch<APIResponse<MenuItem>>(`/menu/items/${id}/toggle`);
      return response.data.data;
    } catch (error) {
      console.error('Error toggling item availability:', error);
      throw error;
    }
  }

  // Special endpoints
  async getFullMenu(): Promise<{category: MenuCategory, items: MenuItem[]}[]> {
    try {
      const response = await api.get<APIResponse<{category: MenuCategory, items: MenuItem[]}[]>>('/menu/full');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching full menu:', error);
      throw error;
    }
  }

  async getFeaturedItems(limit = 6): Promise<MenuItem[]> {
    try {
      const response = await api.get<APIResponse<MenuItem[]>>(`/menu/featured?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching featured items:', error);
      throw error;
    }
  }

  // Utility methods
  async getMenuByCategory(categoryId: string): Promise<MenuItem[]> {
    try {
      const result = await this.getMenuItems({ categoryId, available: true, limit: 100 });
      return result.items;
    } catch (error) {
      console.error('Error fetching menu by category:', error);
      throw error;
    }
  }
}

const menuService = new MenuService();
export default menuService;