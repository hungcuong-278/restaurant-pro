/**
 * Print Receipt Utility
 * Utilities for printing kitchen orders and customer receipts
 */

import type { Order } from '../services/orderService';

/**
 * Generate HTML for kitchen receipt
 */
const generateKitchenReceiptHTML = (order: Order): string => {
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('vi-VN');
  const formattedTime = orderDate.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Kitchen Order #${order.order_number}</title>
      <style>
        @media print {
          @page { margin: 0; }
          body { margin: 1cm; }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          max-width: 80mm;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 12px;
        }
        
        .order-info {
          margin-bottom: 15px;
        }
        
        .order-info div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .order-info strong {
          font-weight: bold;
        }
        
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 15px 0;
        }
        
        .item {
          margin: 10px 0;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        
        .item-notes {
          margin-top: 5px;
          padding-left: 10px;
          font-style: italic;
          color: #666;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-preparing { background: #fef3c7; color: #92400e; }
        .status-ready { background: #d1fae5; color: #065f46; }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        .priority {
          background: #fee2e2;
          border: 2px solid #dc2626;
          padding: 10px;
          margin: 10px 0;
          text-align: center;
          font-weight: bold;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KITCHEN ORDER</h1>
        <p>Restaurant Pro</p>
      </div>
      
      <div class="order-info">
        <div>
          <strong>Order #:</strong>
          <span>${order.order_number}</span>
        </div>
        <div>
          <strong>Table:</strong>
          <span>${order.table_number || 'Takeaway'}</span>
        </div>
        <div>
          <strong>Date:</strong>
          <span>${formattedDate}</span>
        </div>
        <div>
          <strong>Time:</strong>
          <span>${formattedTime}</span>
        </div>
        <div>
          <strong>Status:</strong>
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        ${order.customer_name ? `
        <div>
          <strong>Customer:</strong>
          <span>${order.customer_name}</span>
        </div>
        ` : ''}
      </div>
      
      ${order.special_instructions ? `
      <div class="priority">
        ⚠️ SPECIAL INSTRUCTIONS ⚠️<br>
        ${order.special_instructions}
      </div>
      ` : ''}
      
      <div class="items">
        <h3 style="margin: 0 0 10px 0;">ITEMS:</h3>
        ${order.items?.map((item: any) => `
          <div class="item">
            <div class="item-header">
              <span>${item.quantity}x ${item.name}</span>
              <span>${formatPrice(item.price)}</span>
            </div>
            ${item.special_instructions ? `
            <div class="item-notes">
              Note: ${item.special_instructions}
            </div>
            ` : ''}
          </div>
        `).join('') || '<p>No items</p>'}
      </div>
      
      <div class="order-info">
        <div>
          <strong>Subtotal:</strong>
          <span>${formatPrice(order.subtotal || 0)}</span>
        </div>
        ${order.tax ? `
        <div>
          <strong>Tax:</strong>
          <span>${formatPrice(order.tax)}</span>
        </div>
        ` : ''}
        <div style="font-size: 16px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
          <strong>TOTAL:</strong>
          <strong>${formatPrice(order.total)}</strong>
        </div>
      </div>
      
      <div class="footer">
        <p>Printed at: ${new Date().toLocaleString('vi-VN')}</p>
        <p>Thank you!</p>
      </div>
      
      <script>
        // Auto-print when loaded
        window.onload = function() {
          window.print();
          // Close window after printing
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;
};

/**
 * Format price in VND
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Print kitchen order receipt
 */
export const printKitchenReceipt = (order: Order): void => {
  try {
    const html = generateKitchenReceiptHTML(order);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
  } catch (error) {
    console.error('Error printing receipt:', error);
    alert('Could not print receipt. Please check your pop-up settings.');
  }
};

/**
 * Print customer receipt (with prices)
 */
export const printCustomerReceipt = (order: Order): void => {
  printKitchenReceipt(order); // Same format for now
};

/**
 * Download receipt as PDF (future enhancement)
 */
export const downloadReceiptPDF = async (order: Order): Promise<void> => {
  // TODO: Implement PDF generation with jsPDF or similar
  console.log('PDF download coming soon...');
  alert('PDF download feature coming soon!');
};

export default {
  printKitchenReceipt,
  printCustomerReceipt,
  downloadReceiptPDF,
};
