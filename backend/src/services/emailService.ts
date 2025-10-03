/**
 * Email Service
 * 
 * Handles sending emails for reservations and other notifications
 * Uses nodemailer for email delivery
 */

import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface ReservationEmailData {
  customerName: string;
  customerEmail: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  tableNumber: string;
  confirmationCode: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantEmail: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * In development, uses Ethereal (fake SMTP for testing)
   * In production, uses real SMTP credentials from environment variables
   */
  private async initializeTransporter() {
    try {
      if (process.env.NODE_ENV === 'production') {
        // Production: Use real SMTP server
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Development: Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        console.log('[EmailService] Using Ethereal test account:', testAccount.user);
      }
    } catch (error) {
      console.error('[EmailService] Failed to initialize transporter:', error);
    }
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const {
        customerName,
        customerEmail,
        reservationDate,
        reservationTime,
        partySize,
        tableNumber,
        confirmationCode,
        restaurantName,
        restaurantPhone,
        restaurantEmail,
      } = data;

      // Format date for display
      const formattedDate = new Date(reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #D4AF37;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      background: white;
      padding: 30px;
      border: 2px solid #e5e7eb;
    }
    .confirmation-box {
      background: #f9fafb;
      border-left: 4px solid #D4AF37;
      padding: 20px;
      margin: 20px 0;
    }
    .confirmation-code {
      font-size: 24px;
      font-weight: bold;
      color: #D4AF37;
      letter-spacing: 2px;
      text-align: center;
      padding: 15px;
      background: white;
      border: 2px dashed #D4AF37;
      margin: 10px 0;
    }
    .details {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 500;
    }
    .important-notes {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .important-notes h3 {
      margin-top: 0;
      color: #92400e;
    }
    .important-notes ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .important-notes li {
      margin: 5px 0;
      color: #78350f;
    }
    .contact-info {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      margin-top: 20px;
      border-radius: 4px;
    }
    .contact-info p {
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background: #D4AF37;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍽️ ${restaurantName}</h1>
    <p>Reservation Confirmation</p>
  </div>

  <div class="content">
    <h2 style="color: #1f2937; margin-top: 0;">Hello ${customerName}!</h2>
    
    <p style="font-size: 16px;">
      Thank you for choosing ${restaurantName}. Your table reservation has been confirmed!
    </p>

    <div class="confirmation-box">
      <p style="margin: 0; font-weight: 600; color: #4b5563;">Confirmation Code</p>
      <div class="confirmation-code">${confirmationCode}</div>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
        Please present this code upon arrival
      </p>
    </div>

    <div class="details">
      <h3 style="margin-top: 0; color: #1f2937;">Reservation Details</h3>
      
      <div class="detail-row">
        <span class="detail-label">📅 Date:</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">🕐 Time:</span>
        <span class="detail-value">${reservationTime}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">👥 Party Size:</span>
        <span class="detail-value">${partySize} ${partySize === 1 ? 'guest' : 'guests'}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">🪑 Table:</span>
        <span class="detail-value">${tableNumber}</span>
      </div>
    </div>

    <div class="important-notes">
      <h3>📌 Important Information</h3>
      <ul>
        <li>Please arrive <strong>10-15 minutes early</strong> to ensure a smooth check-in</li>
        <li>We will hold your table for <strong>15 minutes</strong> past your reservation time</li>
        <li>For cancellations or changes, please contact us at least <strong>2 hours in advance</strong></li>
        <li>Present your <strong>confirmation code</strong> upon arrival</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/reservations/my-reservations" class="button">
        View My Reservations
      </a>
    </div>

    <div class="contact-info">
      <h3 style="margin-top: 0; color: #1f2937;">Need to make changes?</h3>
      <p><strong>Phone:</strong> ${restaurantPhone}</p>
      <p><strong>Email:</strong> ${restaurantEmail}</p>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing ${restaurantName}</p>
    <p>We look forward to serving you!</p>
    <p style="margin-top: 15px; font-size: 12px;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
      `;

      const mailOptions = {
        from: `"${restaurantName}" <${restaurantEmail}>`,
        to: customerEmail,
        subject: `Reservation Confirmation - ${confirmationCode}`,
        html: emailHTML,
        text: `
Reservation Confirmation

Hello ${customerName},

Thank you for choosing ${restaurantName}. Your table reservation has been confirmed!

CONFIRMATION CODE: ${confirmationCode}

Reservation Details:
- Date: ${formattedDate}
- Time: ${reservationTime}
- Party Size: ${partySize} ${partySize === 1 ? 'guest' : 'guests'}
- Table: ${tableNumber}

Important Information:
- Please arrive 10-15 minutes early
- We will hold your table for 15 minutes past your reservation time
- For cancellations or changes, please contact us at least 2 hours in advance
- Present your confirmation code upon arrival

Contact Us:
Phone: ${restaurantPhone}
Email: ${restaurantEmail}

We look forward to serving you!

${restaurantName}
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log success
      console.log('[EmailService] Email sent successfully:', info.messageId);
      
      // In development, get preview URL
      const previewUrl = process.env.NODE_ENV !== 'production' 
        ? nodemailer.getTestMessageUrl(info)
        : undefined;
      
      if (previewUrl) {
        console.log('[EmailService] Preview URL:', previewUrl);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error: any) {
      console.error('[EmailService] Failed to send email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send reservation cancellation email
   */
  async sendCancellationEmail(data: ReservationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const {
        customerName,
        customerEmail,
        confirmationCode,
        restaurantName,
        restaurantPhone,
        restaurantEmail,
      } = data;

      const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #dc2626;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border: 2px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${restaurantName}</h1>
    <p>Reservation Cancellation</p>
  </div>
  <div class="content">
    <h2>Hello ${customerName},</h2>
    <p>Your reservation (Confirmation Code: <strong>${confirmationCode}</strong>) has been successfully cancelled.</p>
    <p>We hope to see you again soon!</p>
    <p><strong>Contact Us:</strong><br>Phone: ${restaurantPhone}<br>Email: ${restaurantEmail}</p>
  </div>
</body>
</html>
      `;

      const mailOptions = {
        from: `"${restaurantName}" <${restaurantEmail}>`,
        to: customerEmail,
        subject: `Reservation Cancelled - ${confirmationCode}`,
        html: emailHTML,
        text: `
Reservation Cancellation

Hello ${customerName},

Your reservation (Confirmation Code: ${confirmationCode}) has been successfully cancelled.

We hope to see you again soon!

Contact Us:
Phone: ${restaurantPhone}
Email: ${restaurantEmail}

${restaurantName}
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[EmailService] Cancellation email sent:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('[EmailService] Failed to send cancellation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }
}

export default new EmailService();
