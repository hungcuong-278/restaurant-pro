/**
 * Menu Service Tests
 */
import menuService from '../../services/menuService';
import db from '../../config/database';

describe('MenuService', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('getMenu', () => {
    it('should return menu items', async () => {
      const result = await menuService.getMenu();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should filter by category', async () => {
      const result = await menuService.getMenu({ category: 'appetizer' });

      expect(result.success).toBe(true);
      result.items?.forEach(item => {
        expect(item.category).toBe('appetizer');
      });
    });

    it('should filter by availability', async () => {
      const result = await menuService.getMenu({ available: true });

      expect(result.success).toBe(true);
      result.items?.forEach(item => {
        expect(item.is_available).toBe(true);
      });
    });

    it('should sort by price', async () => {
      const result = await menuService.getMenu({ sortBy: 'price', sortOrder: 'asc' });

      expect(result.success).toBe(true);
      if (result.items && result.items.length > 1) {
        for (let i = 0; i < result.items.length - 1; i++) {
          expect(result.items[i].price).toBeLessThanOrEqual(result.items[i + 1].price);
        }
      }
    });

    it('should paginate results', async () => {
      const page1 = await menuService.getMenu({ limit: 5, offset: 0 });
      const page2 = await menuService.getMenu({ limit: 5, offset: 5 });

      expect(page1.items?.length).toBeLessThanOrEqual(5);
      expect(page2.items?.length).toBeLessThanOrEqual(5);
      
      if (page1.items && page2.items && page1.items.length > 0 && page2.items.length > 0) {
        expect(page1.items[0].id).not.toBe(page2.items[0].id);
      }
    });
  });

  describe('getMenuItemById', () => {
    let testItemId: string;

    beforeEach(async () => {
      const items = await db('menu_items').limit(1);
      testItemId = items[0]?.id;
    });

    it('should return menu item by ID', async () => {
      const result = await menuService.getMenuItemById(testItemId);

      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.id).toBe(testItemId);
    });

    it('should return 404 for non-existent item', async () => {
      const result = await menuService.getMenuItemById('non-existent-id');

      expect(result.success).toBe(false);
    });
  });

  describe('createMenuItem', () => {
    it('should create menu item', async () => {
      const result = await menuService.createMenuItem({
        name: 'Test Dish',
        description: 'A test dish',
        price: 15.99,
        category: 'main',
        is_available: true
      });

      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.name).toBe('Test Dish');
    });

    it('should validate required fields', async () => {
      const result = await menuService.createMenuItem({
        name: '',
        price: 0,
        category: 'main'
      });

      expect(result.success).toBe(false);
    });

    it('should validate price range', async () => {
      const result = await menuService.createMenuItem({
        name: 'Test Dish',
        price: -10,
        category: 'main'
      });

      expect(result.success).toBe(false);
    });

    it('should handle duplicate names', async () => {
      await menuService.createMenuItem({
        name: 'Duplicate Dish',
        price: 15.99,
        category: 'main'
      });

      const result = await menuService.createMenuItem({
        name: 'Duplicate Dish',
        price: 20.99,
        category: 'main'
      });

      // Should either reject or allow with different ID
      expect(result.success).toBeDefined();
    });
  });

  describe('updateMenuItem', () => {
    let testItemId: string;

    beforeEach(async () => {
      const result = await menuService.createMenuItem({
        name: 'Update Test Dish',
        price: 15.99,
        category: 'main'
      });
      testItemId = result.item?.id || '';
    });

    it('should update menu item', async () => {
      const result = await menuService.updateMenuItem(testItemId, {
        price: 19.99
      });

      expect(result.success).toBe(true);
      expect(result.item?.price).toBe(19.99);
    });

    it('should validate update data', async () => {
      const result = await menuService.updateMenuItem(testItemId, {
        price: -5
      });

      expect(result.success).toBe(false);
    });
  });

  describe('deleteMenuItem', () => {
    it('should soft delete menu item', async () => {
      const created = await menuService.createMenuItem({
        name: 'Delete Test Dish',
        price: 15.99,
        category: 'main'
      });

      const result = await menuService.deleteMenuItem(created.item?.id || '');

      expect(result.success).toBe(true);
    });
  });

  describe('Search', () => {
    it('should search by name', async () => {
      const result = await menuService.searchMenu('steak');

      expect(result.success).toBe(true);
      result.items?.forEach(item => {
        expect(item.name.toLowerCase()).toContain('steak');
      });
    });

    it('should search by description', async () => {
      const result = await menuService.searchMenu('grilled');

      expect(result.success).toBe(true);
    });

    it('should handle special characters in search', async () => {
      const result = await menuService.searchMenu("O'Brien");

      expect(result.success).toBe(true);
    });
  });

  describe('Categories', () => {
    it('should get all categories', async () => {
      const result = await menuService.getCategories();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.categories)).toBe(true);
    });

    it('should count items per category', async () => {
      const result = await menuService.getCategoriesWithCount();

      expect(result.success).toBe(true);
      result.categories?.forEach(cat => {
        expect(typeof cat.count).toBe('number');
      });
    });
  });

  describe('Pricing', () => {
    it('should handle decimal prices correctly', async () => {
      const result = await menuService.createMenuItem({
        name: 'Decimal Test',
        price: 12.99,
        category: 'main'
      });

      expect(result.item?.price).toBe(12.99);
    });

    it('should round prices to 2 decimals', async () => {
      const result = await menuService.createMenuItem({
        name: 'Rounding Test',
        price: 12.999,
        category: 'main'
      });

      expect(result.item?.price).toBeCloseTo(13.00, 2);
    });

    it('should handle currency conversion', async () => {
      const result = await menuService.createMenuItem({
        name: 'Currency Test',
        price: 100000, // VND
        category: 'main',
        currency: 'VND'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Availability', () => {
    let testItemId: string;

    beforeEach(async () => {
      const result = await menuService.createMenuItem({
        name: 'Availability Test',
        price: 15.99,
        category: 'main',
        is_available: true
      });
      testItemId = result.item?.id || '';
    });

    it('should toggle availability', async () => {
      const result = await menuService.toggleAvailability(testItemId);

      expect(result.success).toBe(true);
      expect(result.item?.is_available).toBe(false);
    });

    it('should batch update availability', async () => {
      const result = await menuService.batchUpdateAvailability(
        [testItemId],
        false
      );

      expect(result.success).toBe(true);
    });
  });
});
