import { Knex } from 'knex';
import db from '../config/database';

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
  category?: MenuCategory;
}

class MenuService {
  // Menu Categories
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    return db('menu_categories')
      .where({ restaurant_id: restaurantId, is_active: true })
      .orderBy('sort_order', 'asc');
  }

  async getCategoryById(id: string, restaurantId: string): Promise<MenuCategory | null> {
    const category = await db('menu_categories')
      .where({ id, restaurant_id: restaurantId })
      .first();
    return category || null;
  }

  async createCategory(data: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    const [category] = await db('menu_categories')
      .insert(data)
      .returning('*');
    return category;
  }

  async updateCategory(id: string, restaurantId: string, data: Partial<MenuCategory>): Promise<MenuCategory | null> {
    const [category] = await db('menu_categories')
      .where({ id, restaurant_id: restaurantId })
      .update(data)
      .returning('*');
    return category || null;
  }

  async deleteCategory(id: string, restaurantId: string): Promise<boolean> {
    const deleted = await db('menu_categories')
      .where({ id, restaurant_id: restaurantId })
      .del();
    return deleted > 0;
  }

  // Menu Items
  async getMenuItems(
    restaurantId: string, 
    filters: {
      categoryId?: string;
      available?: boolean;
      featured?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{items: MenuItem[], total: number}> {
    const { categoryId, available, featured, page = 1, limit = 10 } = filters;
    
    let query = db('menu_items')
      .leftJoin('menu_categories', 'menu_items.category_id', 'menu_categories.id')
      .select(
        'menu_items.*',
        'menu_categories.name as category_name',
        'menu_categories.slug as category_slug'
      )
      .where('menu_items.restaurant_id', restaurantId);

    if (categoryId) {
      query = query.where('menu_items.category_id', categoryId);
    }

    if (typeof available === 'boolean') {
      query = query.where('menu_items.is_available', available);
    }

    if (typeof featured === 'boolean') {
      query = query.where('menu_items.is_featured', featured);
    }

    // Get total count
    const countQuery = query.clone().count('menu_items.id as total');
    const [{ total }] = await countQuery;

    // Get paginated results
    const offset = (page - 1) * limit;
    const items = await query
      .orderBy('menu_items.sort_order', 'asc')
      .orderBy('menu_items.name', 'asc')
      .limit(limit)
      .offset(offset);

    // Parse JSON fields
    const parsedItems = items.map(item => ({
      ...item,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      dietary_info: item.dietary_info ? JSON.parse(item.dietary_info) : [],
      category: item.category_name ? {
        name: item.category_name,
        slug: item.category_slug
      } : null
    }));

    return {
      items: parsedItems,
      total: Number(total)
    };
  }

  async getMenuItemById(id: string, restaurantId: string): Promise<MenuItem | null> {
    const item = await db('menu_items')
      .leftJoin('menu_categories', 'menu_items.category_id', 'menu_categories.id')
      .select(
        'menu_items.*',
        'menu_categories.name as category_name',
        'menu_categories.slug as category_slug'
      )
      .where('menu_items.id', id)
      .where('menu_items.restaurant_id', restaurantId)
      .first();

    if (!item) return null;

    return {
      ...item,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      dietary_info: item.dietary_info ? JSON.parse(item.dietary_info) : [],
      category: item.category_name ? {
        name: item.category_name,
        slug: item.category_slug
      } : null
    };
  }

  async createMenuItem(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<MenuItem> {
    const itemData = {
      ...data,
      allergens: JSON.stringify(data.allergens || []),
      dietary_info: JSON.stringify(data.dietary_info || [])
    };

    const [item] = await db('menu_items')
      .insert(itemData)
      .returning('*');

    return {
      ...item,
      allergens: JSON.parse(item.allergens || '[]'),
      dietary_info: JSON.parse(item.dietary_info || '[]')
    };
  }

  async updateMenuItem(
    id: string, 
    restaurantId: string, 
    data: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>>
  ): Promise<MenuItem | null> {
    const updateData: any = { ...data };
    
    if (data.allergens) {
      updateData.allergens = JSON.stringify(data.allergens);
    }
    
    if (data.dietary_info) {
      updateData.dietary_info = JSON.stringify(data.dietary_info);
    }

    const [item] = await db('menu_items')
      .where({ id, restaurant_id: restaurantId })
      .update(updateData)
      .returning('*');

    if (!item) return null;

    return {
      ...item,
      allergens: JSON.parse(item.allergens || '[]'),
      dietary_info: JSON.parse(item.dietary_info || '[]')
    };
  }

  async deleteMenuItem(id: string, restaurantId: string): Promise<boolean> {
    const deleted = await db('menu_items')
      .where({ id, restaurant_id: restaurantId })
      .del();
    return deleted > 0;
  }

  async toggleItemAvailability(id: string, restaurantId: string): Promise<MenuItem | null> {
    const item = await this.getMenuItemById(id, restaurantId);
    if (!item) return null;

    return this.updateMenuItem(id, restaurantId, {
      is_available: !item.is_available
    });
  }

  // Utility methods
  async getMenuByCategory(restaurantId: string): Promise<{category: MenuCategory, items: MenuItem[]}[]> {
    const categories = await this.getCategories(restaurantId);
    const result = [];

    for (const category of categories) {
      const { items } = await this.getMenuItems(restaurantId, { 
        categoryId: category.id, 
        available: true,
        limit: 100  // Get all items for category
      });
      result.push({ category, items });
    }

    return result;
  }

  async getFeaturedItems(restaurantId: string, limit = 6): Promise<MenuItem[]> {
    const { items } = await this.getMenuItems(restaurantId, { 
      featured: true, 
      available: true, 
      limit 
    });
    return items;
  }
}

export default new MenuService();