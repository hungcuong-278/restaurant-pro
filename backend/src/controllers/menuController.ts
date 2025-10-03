import { Request, Response } from 'express';
import menuService from '../services/menuService';

// Menu Categories Controllers
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.query.restaurant_id as string || 'default'; // In real app, get from auth
    const categories = await menuService.getCategories(restaurantId);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.query.restaurant_id as string || 'default';
    const category = await menuService.getCategoryById(id, restaurantId);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.body.restaurant_id || 'default';
    const categoryData = {
      ...req.body,
      restaurant_id: restaurantId
    };
    
    const category = await menuService.createCategory(categoryData);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.body.restaurant_id || 'default';
    
    const category = await menuService.updateCategory(id, restaurantId, req.body);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.query.restaurant_id as string || 'default';
    
    const deleted = await menuService.deleteCategory(id, restaurantId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
};

// Menu Items Controllers
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.query.restaurant_id as string || 'default';
    const filters = {
      categoryId: req.query.category_id as string,
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    };

    const result = await menuService.getMenuItems(restaurantId, filters);
    
    res.json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items'
    });
  }
};

export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.query.restaurant_id as string || 'default';
    const item = await menuService.getMenuItemById(id, restaurantId);
    
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item'
    });
  }
};

export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.body.restaurant_id || 'default';
    const itemData = {
      ...req.body,
      restaurant_id: restaurantId
    };
    
    const item = await menuService.createMenuItem(itemData);
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item'
    });
  }
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.body.restaurant_id || 'default';
    
    const item = await menuService.updateMenuItem(id, restaurantId, req.body);
    
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item'
    });
  }
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.query.restaurant_id as string || 'default';
    
    const deleted = await menuService.deleteMenuItem(id, restaurantId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item'
    });
  }
};

export const toggleItemAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.body.restaurant_id || 'default';
    
    const item = await menuService.toggleItemAvailability(id, restaurantId);
    
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      message: `Item ${item.is_available ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling item availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle item availability'
    });
  }
};

// Special Menu endpoints
export const getMenuByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.query.restaurant_id as string || 'default';
    const menu = await menuService.getMenuByCategory(restaurantId);
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Error fetching menu by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu'
    });
  }
};

export const getFeaturedItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.query.restaurant_id as string || 'default';
    const limit = parseInt(req.query.limit as string) || 6;
    const items = await menuService.getFeaturedItems(restaurantId, limit);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured items'
    });
  }
};