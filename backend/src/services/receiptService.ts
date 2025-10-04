/**
 * Receipt Generation Service
 * Week 7 - Phase 3 - Task 3.6
 * 
 * Generates HTML/text receipts for orders
 */

import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('ReceiptService');

interface ReceiptData {
  order: {
    id: string;
    order_number: string;
    table_number: string;
    customer_name?: string;
    created_at: string;
    completed_at?: string;
    status: string;
    payment_status: string;
    total_amount: number;
  };
  items: Array<{
    item_name: string;
    quantity: number;
    item_price: number;
    total_price: number;
    special_instructions?: string;
  }>;
  payments: Array<{
    payment_method: string;
    amount: number;
    transaction_id?: string;
    created_at: string;
  }>;
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

class ReceiptService {
  /**
   * Get receipt data for an order
   */
  async getReceiptData(orderId: string): Promise<ReceiptData> {
    logger.info('Fetching receipt data', { orderId });

    try {
      // Get order with restaurant and table info
      const order = await db('orders')
        .select(
          'orders.*',
          'restaurants.name as restaurant_name',
          'restaurants.address as restaurant_address',
          'restaurants.phone as restaurant_phone',
          'restaurants.email as restaurant_email',
          'tables.number as table_number'
        )
        .leftJoin('restaurants', 'orders.restaurant_id', 'restaurants.id')
        .leftJoin('tables', 'orders.table_id', 'tables.id')
        .where('orders.id', orderId)
        .first();

      if (!order) {
        throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
      }

      // Get order items with menu item details
      const items = await db('order_items')
        .select(
          'order_items.quantity',
          'order_items.item_price',
          'order_items.total_price',
          'order_items.special_instructions',
          'menu_items.name as item_name'
        )
        .leftJoin('menu_items', 'order_items.menu_item_id', 'menu_items.id')
        .where('order_items.order_id', orderId);

      // Get payments
      const payments = await db('payments')
        .select('payment_method', 'amount', 'transaction_id', 'created_at')
        .where('order_id', orderId)
        .where('status', 'completed')
        .orderBy('created_at', 'asc');

      return {
        order: {
          id: order.id,
          order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
          table_number: order.table_number || 'N/A',
          customer_name: order.customer_name,
          created_at: order.created_at,
          completed_at: order.completed_at,
          status: order.status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
        },
        items: items.map(item => ({
          item_name: item.item_name || 'Unknown Item',
          quantity: item.quantity,
          item_price: item.item_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions,
        })),
        payments: payments.map(p => ({
          payment_method: p.payment_method,
          amount: p.amount,
          transaction_id: p.transaction_id,
          created_at: p.created_at,
        })),
        restaurant: {
          name: order.restaurant_name || 'Restaurant',
          address: order.restaurant_address,
          phone: order.restaurant_phone,
          email: order.restaurant_email,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to fetch receipt data', { error, orderId });
      throw error;
    }
  }

  /**
   * Generate HTML receipt
   */
  async generateHTMLReceipt(orderId: string): Promise<string> {
    const data = await this.getReceiptData(orderId);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${data.order.order_number}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .receipt {
      background: white;
      padding: 30px;
      border: 2px dashed #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .restaurant-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .restaurant-info {
      font-size: 12px;
      color: #666;
    }
    .order-info {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px dashed #999;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }
    .items-section {
      margin-bottom: 20px;
    }
    .items-header {
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #333;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .item-name {
      flex: 1;
    }
    .item-qty {
      width: 30px;
      text-align: center;
    }
    .item-price {
      width: 80px;
      text-align: right;
    }
    .special-instructions {
      font-size: 12px;
      color: #666;
      margin-left: 10px;
      font-style: italic;
    }
    .totals {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #333;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .total-row.grand {
      font-size: 20px;
      font-weight: bold;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #333;
    }
    .payments-section {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px dashed #999;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #333;
      font-size: 14px;
    }
    .thank-you {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    @media print {
      body {
        background: white;
        margin: 0;
      }
      .receipt {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="restaurant-name">${data.restaurant.name}</div>
      ${data.restaurant.address ? `<div class="restaurant-info">${data.restaurant.address}</div>` : ''}
      ${data.restaurant.phone ? `<div class="restaurant-info">Tel: ${data.restaurant.phone}</div>` : ''}
      ${data.restaurant.email ? `<div class="restaurant-info">${data.restaurant.email}</div>` : ''}
    </div>

    <!-- Order Info -->
    <div class="order-info">
      <div class="info-row">
        <span>Order Number:</span>
        <span><strong>${data.order.order_number}</strong></span>
      </div>
      <div class="info-row">
        <span>Table:</span>
        <span>${data.order.table_number}</span>
      </div>
      ${data.order.customer_name ? `
      <div class="info-row">
        <span>Customer:</span>
        <span>${data.order.customer_name}</span>
      </div>` : ''}
      <div class="info-row">
        <span>Date:</span>
        <span>${new Date(data.order.created_at).toLocaleString()}</span>
      </div>
      ${data.order.completed_at ? `
      <div class="info-row">
        <span>Completed:</span>
        <span>${new Date(data.order.completed_at).toLocaleString()}</span>
      </div>` : ''}
    </div>

    <!-- Items -->
    <div class="items-section">
      <div class="items-header">ITEMS</div>
      ${data.items.map(item => `
        <div class="item-row">
          <span class="item-name">${item.item_name}</span>
          <span class="item-qty">×${item.quantity}</span>
          <span class="item-price">${item.total_price.toLocaleString()}đ</span>
        </div>
        ${item.special_instructions ? `<div class="special-instructions">Note: ${item.special_instructions}</div>` : ''}
      `).join('')}
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row grand">
        <span>TOTAL:</span>
        <span>${data.order.total_amount.toLocaleString()}đ</span>
      </div>
    </div>

    <!-- Payments -->
    ${data.payments.length > 0 ? `
    <div class="payments-section">
      <div class="items-header">PAYMENTS</div>
      ${data.payments.map(payment => `
        <div class="payment-row">
          <span>${this.formatPaymentMethod(payment.payment_method)}</span>
          <span>${payment.amount.toLocaleString()}đ</span>
        </div>
        ${payment.transaction_id ? `<div class="special-instructions">TXN: ${payment.transaction_id}</div>` : ''}
      `).join('')}
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">Thank You!</div>
      <div>Please come again</div>
      <div style="margin-top: 10px; font-size: 12px; color: #999;">
        Generated on ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return html.trim();
  }

  /**
   * Generate text receipt (for printing)
   */
  async generateTextReceipt(orderId: string): Promise<string> {
    const data = await this.getReceiptData(orderId);

    const lines: string[] = [];
    const width = 42; // Receipt paper width

    // Helper functions
    const center = (text: string) => {
      const padding = Math.max(0, Math.floor((width - text.length) / 2));
      return ' '.repeat(padding) + text;
    };

    const line = (char: string = '-') => char.repeat(width);

    const row = (left: string, right: string) => {
      const spaces = Math.max(1, width - left.length - right.length);
      return left + ' '.repeat(spaces) + right;
    };

    // Header
    lines.push(line('='));
    lines.push(center(data.restaurant.name.toUpperCase()));
    if (data.restaurant.address) lines.push(center(data.restaurant.address));
    if (data.restaurant.phone) lines.push(center(`Tel: ${data.restaurant.phone}`));
    lines.push(line('='));
    lines.push('');

    // Order info
    lines.push(row('Order:', data.order.order_number));
    lines.push(row('Table:', data.order.table_number));
    if (data.order.customer_name) {
      lines.push(row('Customer:', data.order.customer_name));
    }
    lines.push(row('Date:', new Date(data.order.created_at).toLocaleString()));
    lines.push(line('-'));
    lines.push('');

    // Items
    lines.push('ITEMS:');
    data.items.forEach(item => {
      lines.push(row(
        `${item.item_name} x${item.quantity}`,
        `${item.total_price.toLocaleString()}đ`
      ));
      if (item.special_instructions) {
        lines.push(`  Note: ${item.special_instructions}`);
      }
    });
    lines.push('');
    lines.push(line('='));

    // Total
    lines.push(row('TOTAL:', `${data.order.total_amount.toLocaleString()}đ`));
    lines.push(line('='));
    lines.push('');

    // Payments
    if (data.payments.length > 0) {
      lines.push('PAYMENTS:');
      data.payments.forEach(payment => {
        lines.push(row(
          this.formatPaymentMethod(payment.payment_method),
          `${payment.amount.toLocaleString()}đ`
        ));
        if (payment.transaction_id) {
          lines.push(`  TXN: ${payment.transaction_id}`);
        }
      });
      lines.push(line('-'));
      lines.push('');
    }

    // Footer
    lines.push(center('Thank You!'));
    lines.push(center('Please come again'));
    lines.push('');
    lines.push(center(new Date().toLocaleString()));
    lines.push(line('='));

    return lines.join('\n');
  }

  /**
   * Format payment method for display
   */
  private formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      cash: 'Cash',
      card: 'Card',
      digital_wallet: 'Digital Wallet',
      mobile: 'Mobile Payment',
      bank_transfer: 'Bank Transfer',
    };
    return methods[method] || method;
  }
}

export default new ReceiptService();
