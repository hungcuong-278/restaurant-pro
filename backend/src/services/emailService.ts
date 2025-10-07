/**
 * Email Notification Service
 * Handles sending emails for reservations, orders, and payments
 */

import nodemailer from 'nodemailer';
import { createLogger } from '../utils/logger';

const logger = createLogger('EmailService');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ReservationEmailData {
  email: string;
  name: string;
  reservationId: string;
  date: string;
  time: string;
  partySize: number;
  tableNumber?: string;
  specialRequests?: string;
}

interface OrderEmailData {
  email: string;
  name: string;
  orderId: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  estimatedTime?: string;
}

interface PaymentEmailData {
  email: string;
  name: string;
  orderId: string;
  paymentId: string;
  amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: string;
  transactionDate: string;
}

class EmailService {
  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Check if email is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email not configured. Skipping email send.', {
          to: options.to,
          subject: options.subject,
        });
        return;
      }

      const info = await transporter.sendMail({
        from: `"Restaurant Pro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error: any) {
      logger.error('Failed to send email', {
        error: error.message,
        to: options.to,
        subject: options.subject,
      });
      // Don't throw - email failures shouldn't break the app
    }
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
            background: #f9fafb;
          }
          .details-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .details-card h3 {
            margin-top: 0;
            color: #667eea;
            font-size: 18px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Reservation Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Your reservation has been confirmed. We look forward to serving you!</p>
          
          <div class="details-card">
            <h3>Reservation Details</h3>
            <div class="detail-row">
              <span class="detail-label">Confirmation Number:</span>
              <span class="detail-value"><strong>#${data.reservationId}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Party Size:</span>
              <span class="detail-value">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
            ${data.tableNumber ? `
            <div class="detail-row">
              <span class="detail-label">Table Number:</span>
              <span class="detail-value">${data.tableNumber}</span>
            </div>
            ` : ''}
            ${data.specialRequests ? `
            <div class="detail-row">
              <span class="detail-label">Special Requests:</span>
              <span class="detail-value">${data.specialRequests}</span>
            </div>
            ` : ''}
          </div>

          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Please arrive 10 minutes before your reservation time</li>
            <li>If you need to cancel or modify, please contact us at least 24 hours in advance</li>
            <li>We can hold your table for 15 minutes after your reservation time</li>
          </ul>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservations/${data.reservationId}" class="button">
              View Reservation
            </a>
          </center>

          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>We can't wait to see you!</p>
        </div>
        <div class="footer">
          <p><strong>Restaurant Pro</strong></p>
          <p>123 Main Street, City, State 12345</p>
          <p>Phone: (555) 123-4567 | Email: info@restaurantpro.com</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            This email was sent to ${data.email}. If you did not make this reservation, please contact us immediately.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Reservation Confirmed!

Dear ${data.name},

Your reservation has been confirmed. Here are the details:

Confirmation Number: #${data.reservationId}
Date: ${data.date}
Time: ${data.time}
Party Size: ${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}
${data.tableNumber ? `Table Number: ${data.tableNumber}` : ''}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ''}

Important Information:
- Please arrive 10 minutes before your reservation time
- If you need to cancel or modify, please contact us at least 24 hours in advance
- We can hold your table for 15 minutes after your reservation time

We look forward to serving you!

Restaurant Pro
123 Main Street, City, State 12345
Phone: (555) 123-4567
    `.trim();

    await this.sendEmail({
      to: data.email,
      subject: `Reservation Confirmed - ${data.date} at ${data.time}`,
      html,
      text,
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(data: OrderEmailData): Promise<void> {
    const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared.',
        emoji: '✅',
      },
      preparing: {
        title: 'Order in Progress',
        message: 'Your order is now being prepared by our kitchen.',
        emoji: '👨‍🍳',
      },
      ready: {
        title: 'Order Ready!',
        message: 'Your order is ready for pickup/delivery!',
        emoji: '🎉',
      },
      completed: {
        title: 'Order Completed',
        message: 'Your order has been completed. Thank you for your business!',
        emoji: '✨',
      },
    };

    const statusInfo = statusMessages[data.status] || {
      title: 'Order Update',
      message: `Your order status has been updated to: ${data.status}`,
      emoji: '📦',
    };

    const itemsList = data.items
      .map(
        (item) => `
          <div class="detail-row">
            <span>${item.quantity}x ${item.name}</span>
            <span class="detail-value">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
            background: #f9fafb;
          }
          .details-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .details-card h3 {
            margin-top: 0;
            color: #667eea;
            font-size: 18px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-value {
            font-weight: 600;
            color: #111827;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #667eea;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>${statusInfo.message}</p>
          
          ${data.estimatedTime ? `<p><strong>Estimated ready time:</strong> ${data.estimatedTime}</p>` : ''}

          <div class="details-card">
            <h3>Order #${data.orderId}</h3>
            <div class="status-badge">${data.status.toUpperCase()}</div>
            ${itemsList}
            <div class="total-row">
              <span>Total:</span>
              <span>$${data.total.toFixed(2)}</span>
            </div>
          </div>

          <p>If you have any questions about your order, please contact us.</p>
        </div>
        <div class="footer">
          <p><strong>Restaurant Pro</strong></p>
          <p>Phone: (555) 123-4567 | Email: orders@restaurantpro.com</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: data.email,
      subject: `Order ${statusInfo.title} - #${data.orderId}`,
      html,
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(data: PaymentEmailData): Promise<void> {
    const itemsList = data.items
      .map(
        (item) => `
          <div class="detail-row">
            <span>${item.quantity}x ${item.name}</span>
            <span class="detail-value">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
            background: #f9fafb;
          }
          .details-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .details-card h3 {
            margin-top: 0;
            color: #10b981;
            font-size: 18px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
            border-top: 2px solid #10b981;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Thank you for your payment! This is your receipt for order #${data.orderId}.</p>
          
          <div class="details-card">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${data.paymentId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">#${data.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction Date:</span>
              <span class="detail-value">${data.transactionDate}</span>
            </div>
            ${data.paymentMethod ? `
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            ` : ''}
          </div>

          <div class="details-card">
            <h3>Order Items</h3>
            ${itemsList}
            <div class="total-row">
              <span>Total Paid:</span>
              <span>$${data.amount.toFixed(2)}</span>
            </div>
          </div>

          <p>This receipt is for your records. If you have any questions, please contact us.</p>
        </div>
        <div class="footer">
          <p><strong>Restaurant Pro</strong></p>
          <p>123 Main Street, City, State 12345</p>
          <p>Phone: (555) 123-4567 | Email: billing@restaurantpro.com</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            This is an automated receipt. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: data.email,
      subject: `Payment Receipt - Order #${data.orderId}`,
      html,
    });
  }
}

export default new EmailService();
