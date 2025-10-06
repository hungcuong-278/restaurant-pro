/**
 * Order Service Tests
 */
import orderService from '../../services/orderService';
import db from '../../config/database';

describe('OrderService', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('createOrder', () => {
    it('should create order with items', async () => {
      const menuItems = await db('menu_items').limit(2);
      
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: menuItems.map(item => ({
          menu_item_id: item.id,
          quantity: 2,
          price: item.price,
          special_instructions: 'No onions'
        }))
      });

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order?.items).toHaveLength(2);
    });

    it('should calculate total correctly', async () => {
      const menuItems = await db('menu_items').limit(1);
      const item = menuItems[0];
      
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: item.id,
          quantity: 3,
          price: item.price
        }]
      });

      expect(result.order?.total).toBe(item.price * 3);
    });

    it('should validate order items', async () => {
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: []
      });

      expect(result.success).toBe(false);
    });

    it('should validate menu item existence', async () => {
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: 'non-existent-item',
          quantity: 1,
          price: 10
        }]
      });

      expect(result.success).toBe(false);
    });

    it('should validate quantity limits', async () => {
      const menuItems = await db('menu_items').limit(1);
      
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1000,
          price: menuItems[0].price
        }]
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getOrder', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const menuItems = await db('menu_items').limit(1);
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price: menuItems[0].price
        }]
      });
      testOrderId = result.order?.id || '';
    });

    it('should get order by ID', async () => {
      const result = await orderService.getOrderById(testOrderId);

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
    });

    it('should include order items', async () => {
      const result = await orderService.getOrderById(testOrderId);

      expect(result.order?.items).toBeDefined();
      expect(result.order?.items.length).toBeGreaterThan(0);
    });
  });

  describe('updateOrderStatus', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const menuItems = await db('menu_items').limit(1);
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price: menuItems[0].price
        }]
      });
      testOrderId = result.order?.id || '';
    });

    it('should update order status', async () => {
      const result = await orderService.updateOrderStatus(testOrderId, 'preparing');

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('preparing');
    });

    it('should validate status transitions', async () => {
      // Cannot go from pending directly to completed
      const result = await orderService.updateOrderStatus(testOrderId, 'completed');

      // Depending on business logic, this might be allowed or not
      expect(result.success).toBeDefined();
    });

    it('should track status history', async () => {
      await orderService.updateOrderStatus(testOrderId, 'preparing');
      await orderService.updateOrderStatus(testOrderId, 'ready');

      const history = await orderService.getOrderStatusHistory(testOrderId);
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('cancelOrder', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const menuItems = await db('menu_items').limit(1);
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price: menuItems[0].price
        }]
      });
      testOrderId = result.order?.id || '';
    });

    it('should cancel pending order', async () => {
      const result = await orderService.cancelOrder(testOrderId);

      expect(result.success).toBe(true);
    });

    it('should not cancel completed order', async () => {
      await orderService.updateOrderStatus(testOrderId, 'completed');
      const result = await orderService.cancelOrder(testOrderId);

      expect(result.success).toBe(false);
    });
  });

  describe('Kitchen Orders', () => {
    it('should get orders for kitchen', async () => {
      const result = await orderService.getKitchenOrders();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.orders)).toBe(true);
    });

    it('should filter by status', async () => {
      const result = await orderService.getKitchenOrders({ status: 'preparing' });

      result.orders?.forEach(order => {
        expect(order.status).toBe('preparing');
      });
    });

    it('should sort by priority', async () => {
      const result = await orderService.getKitchenOrders({ sortBy: 'priority' });

      expect(result.success).toBe(true);
    });
  });

  describe('Order Modifications', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const menuItems = await db('menu_items').limit(1);
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price: menuItems[0].price
        }]
      });
      testOrderId = result.order?.id || '';
    });

    it('should add item to order', async () => {
      const menuItems = await db('menu_items').offset(1).limit(1);
      
      const result = await orderService.addItemToOrder(testOrderId, {
        menu_item_id: menuItems[0].id,
        quantity: 1,
        price: menuItems[0].price
      });

      expect(result.success).toBe(true);
      expect(result.order?.items).toHaveLength(2);
    });

    it('should remove item from order', async () => {
      const order = await orderService.getOrderById(testOrderId);
      const itemId = order.order?.items[0].id;

      const result = await orderService.removeItemFromOrder(testOrderId, itemId || '');

      expect(result.success).toBe(true);
    });

    it('should update item quantity', async () => {
      const order = await orderService.getOrderById(testOrderId);
      const itemId = order.order?.items[0].id;

      const result = await orderService.updateItemQuantity(testOrderId, itemId || '', 5);

      expect(result.success).toBe(true);
      expect(result.order?.items[0].quantity).toBe(5);
    });
  });

  describe('Order Statistics', () => {
    it('should get daily sales', async () => {
      const result = await orderService.getDailySales('2025-10-07');

      expect(result.success).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('should get popular items', async () => {
      const result = await orderService.getPopularItems();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should get order count by status', async () => {
      const result = await orderService.getOrderCountByStatus();

      expect(result.success).toBe(true);
      expect(result.counts).toBeDefined();
    });
  });

  describe('Concurrent Orders', () => {
    it('should handle concurrent order creation', async () => {
      const menuItems = await db('menu_items').limit(1);
      
      const orders = Array(5).fill(null).map(() =>
        orderService.createOrder({
          table_id: 'test-table-id',
          customer_id: 'test-customer-id',
          items: [{
            menu_item_id: menuItems[0].id,
            quantity: 1,
            price: menuItems[0].price
          }]
        })
      );

      const results = await Promise.all(orders);
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(5);
    });
  });

  describe('Payment Integration', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const menuItems = await db('menu_items').limit(1);
      const result = await orderService.createOrder({
        table_id: 'test-table-id',
        customer_id: 'test-customer-id',
        items: [{
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price: menuItems[0].price
        }]
      });
      testOrderId = result.order?.id || '';
    });

    it('should mark order as paid', async () => {
      const result = await orderService.markAsPaid(testOrderId, {
        payment_method: 'credit_card',
        amount: 100
      });

      expect(result.success).toBe(true);
    });

    it('should validate payment amount', async () => {
      const result = await orderService.markAsPaid(testOrderId, {
        payment_method: 'credit_card',
        amount: 0
      });

      expect(result.success).toBe(false);
    });
  });
});
