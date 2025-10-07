# 💳 Stripe Payment Integration Guide

**Restaurant Pro - Complete Stripe Setup & Usage**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What's Implemented

✅ **Backend Services:**
- `stripeService.ts` - Core Stripe API integration
- `stripeController.ts` - API endpoint handlers
- `stripeRoutes.ts` - RESTful API routes
- Webhook handling for payment events
- Refund management
- Payment intent creation & confirmation

✅ **Features:**
- Create payment intents
- Confirm payments
- Cancel payments
- Process refunds
- Webhook event handling
- Automatic payment method detection
- Receipt email support

---

## 🚀 Setup Instructions

### Step 1: Get Stripe API Keys

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Sign up for free (no credit card required for testing)

2. **Get Test Keys:**
   - Navigate to: https://dashboard.stripe.com/test/apikeys
   - Copy **Secret key** (starts with `sk_test_`)
   - Copy **Publishable key** (starts with `pk_test_`)

3. **Setup Webhook (Optional but recommended):**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `http://localhost:5000/api/payments/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy **Signing secret** (starts with `whsec_`)

### Step 2: Configure Environment Variables

1. **Copy example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # Replace with your actual Stripe test keys
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   
   # Payment settings
   PAYMENT_CURRENCY=usd
   PAYMENT_MIN_AMOUNT=0.50
   PAYMENT_MAX_AMOUNT=10000.00
   ```

### Step 3: Install Dependencies

```bash
cd backend
npm install stripe @types/stripe
```

### Step 4: Register Routes in App

**File: `backend/src/app.ts`**

```typescript
import stripeRoutes from './routes/stripeRoutes';

// Add after other routes
app.use('/api/payments/stripe', stripeRoutes);
```

### Step 5: Restart Backend Server

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 📡 API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/payments/stripe/create-intent`

**Purpose:** Initialize a payment for an order

**Request Body:**
```json
{
  "amount": 25.50,
  "orderId": "ORD-12345",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "Payment for Order #ORD-12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3ABC123_secret_XYZ",
    "paymentIntentId": "pi_3ABC123",
    "amount": 2550,
    "currency": "usd"
  }
}
```

**Frontend Usage:**
```typescript
const response = await fetch('/api/payments/stripe/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: order.total,
    orderId: order.id,
    customerEmail: customer.email,
    customerName: customer.name,
  }),
});

const { data } = await response.json();
const { clientSecret } = data;
```

---

### 2. Get Payment Intent Status

**Endpoint:** `GET /api/payments/stripe/intent/:paymentIntentId`

**Purpose:** Check payment status

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "pi_3ABC123",
    "status": "succeeded",
    "amount": 2550,
    "currency": "usd",
    "amountInDollars": 25.50
  }
}
```

**Frontend Usage:**
```typescript
const response = await fetch(`/api/payments/stripe/intent/${paymentIntentId}`);
const { data } = await response.json();

if (data.status === 'succeeded') {
  console.log('Payment successful!');
}
```

---

### 3. Confirm Payment Intent

**Endpoint:** `POST /api/payments/stripe/confirm-intent`

**Purpose:** Manually confirm a payment (usually handled by Stripe Elements)

**Request Body:**
```json
{
  "paymentIntentId": "pi_3ABC123",
  "paymentMethodId": "pm_1ABC456"
}
```

---

### 4. Cancel Payment Intent

**Endpoint:** `POST /api/payments/stripe/cancel-intent`

**Purpose:** Cancel an unpaid payment intent

**Request Body:**
```json
{
  "paymentIntentId": "pi_3ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent cancelled successfully"
}
```

---

### 5. Create Refund

**Endpoint:** `POST /api/payments/stripe/refund`

**Purpose:** Refund a completed payment

**Request Body:**
```json
{
  "paymentIntentId": "pi_3ABC123",
  "amount": 10.00,
  "reason": "requested_by_customer"
}
```

**Full Refund (omit amount):**
```json
{
  "paymentIntentId": "pi_3ABC123",
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_1ABC789",
    "amount": 1000,
    "amountInDollars": 10.00,
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

---

### 6. Webhook Handler

**Endpoint:** `POST /api/payments/stripe/webhook`

**Purpose:** Receive payment event notifications from Stripe

**Events Handled:**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

**Stripe Setup:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `http://localhost:5000/api/payments/stripe/webhook`
3. Select events above
4. Copy signing secret to `.env`

---

## 🎨 Frontend Integration

### Option 1: Stripe Elements (Recommended)

**Install Frontend Dependencies:**
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Create Payment Form Component:**

**File: `frontend/src/components/payments/StripePaymentForm.tsx`**

```typescript
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with publishable key
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create payment intent
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId,
          customerEmail: 'customer@example.com', // Get from form
          customerName: 'John Doe', // Get from form
        }),
      });

      const { data } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else {
        setMessage('Payment successful!');
        onSuccess();
      }
    } catch (error: any) {
      setMessage(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      {message && (
        <div className={`text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </form>
  );
};

export const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const options = {
    mode: 'payment' as const,
    amount: Math.round(props.amount * 100), // Convert to cents
    currency: 'usd',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};
```

**Usage in Order Page:**

```typescript
import { StripePaymentForm } from '../../components/payments/StripePaymentForm';

const OrderPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const order = { id: 'ORD-123', total: 25.50 };

  return (
    <div>
      {showPayment ? (
        <StripePaymentForm
          orderId={order.id}
          amount={order.total}
          onSuccess={() => {
            console.log('Payment successful!');
            // Update order status, show confirmation
          }}
          onError={(error) => {
            console.error('Payment failed:', error);
            // Show error message
          }}
        />
      ) : (
        <button onClick={() => setShowPayment(true)}>
          Pay Now
        </button>
      )}
    </div>
  );
};
```

---

### Option 2: Payment Request Button (Apple Pay, Google Pay)

```typescript
import { PaymentRequestButtonElement } from '@stripe/react-stripe-js';

const PaymentRequestButton = ({ amount }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Order Total',
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, amount]);

  if (!paymentRequest) return null;

  return <PaymentRequestButtonElement options={{ paymentRequest }} />;
};
```

---

## 🧪 Testing

### 1. Test Cards

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

**Payment Declined:**
- Card: `4000 0000 0000 9995`

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

**More test cards:** https://stripe.com/docs/testing

### 2. Test with Postman

**Create Payment Intent:**
```bash
POST http://localhost:5000/api/payments/stripe/create-intent
Content-Type: application/json

{
  "amount": 25.50,
  "orderId": "TEST-001",
  "customerEmail": "test@example.com",
  "customerName": "Test User"
}
```

**Get Payment Status:**
```bash
GET http://localhost:5000/api/payments/stripe/intent/pi_xxxxx
```

**Create Refund:**
```bash
POST http://localhost:5000/api/payments/stripe/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_xxxxx",
  "amount": 10.00,
  "reason": "requested_by_customer"
}
```

### 3. Test Webhooks Locally

**Install Stripe CLI:**
```bash
# Windows (Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

**Login to Stripe:**
```bash
stripe login
```

**Forward Webhooks to Local Server:**
```bash
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
```

**Trigger Test Events:**
```bash
# Successful payment
stripe trigger payment_intent.succeeded

# Failed payment
stripe trigger payment_intent.payment_failed

# Refund
stripe trigger charge.refunded
```

---

## 🔒 Security Best Practices

### ✅ DO's:

1. **Never expose secret key in frontend**
   - Only use publishable key (`pk_test_`) in frontend
   - Keep secret key (`sk_test_`) in backend `.env` file

2. **Always verify webhook signatures**
   - Use `STRIPE_WEBHOOK_SECRET` to verify events
   - Prevents fake webhook attacks

3. **Use HTTPS in production**
   - Stripe requires HTTPS for webhooks
   - Get free SSL with Let's Encrypt

4. **Validate amounts on backend**
   - Never trust frontend payment amounts
   - Always recalculate on server

5. **Store payment metadata**
   - Add `orderId`, `customerId` to payment intent metadata
   - Helps track payments to orders

6. **Handle idempotency**
   - Stripe automatically handles duplicate requests with same idempotency key
   - Use `Idempotency-Key` header for critical operations

### ❌ DON'Ts:

1. **Don't commit `.env` file**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Don't store card details**
   - Let Stripe handle all sensitive data
   - Never save CVV, even encrypted

3. **Don't use test keys in production**
   - Replace `sk_test_` with `sk_live_` for production
   - Use environment-specific keys

4. **Don't ignore webhook events**
   - Always handle `payment_intent.succeeded`
   - Update order status based on webhooks

5. **Don't skip error handling**
   - Show user-friendly error messages
   - Log errors for debugging

---

## 🐛 Troubleshooting

### Issue: "Stripe is not defined"

**Solution:**
```bash
npm install stripe @types/stripe
```

### Issue: "Invalid API key"

**Solution:**
- Check `.env` file has correct `STRIPE_SECRET_KEY`
- Ensure key starts with `sk_test_` (test) or `sk_live_` (production)
- Restart backend server after changing `.env`

### Issue: "Webhook signature verification failed"

**Solution:**
- Check `STRIPE_WEBHOOK_SECRET` in `.env`
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/payments/stripe/webhook`
- Ensure webhook endpoint uses raw body: `express.raw({ type: 'application/json' })`

### Issue: "Amount too small"

**Solution:**
- Minimum amount is $0.50 (50 cents)
- Check `PAYMENT_MIN_AMOUNT` in `.env`
- Stripe rejects amounts < 50 cents

### Issue: "Payment stuck in 'processing'"

**Solution:**
- Check Stripe Dashboard: https://dashboard.stripe.com/test/payments
- Look for error messages
- Ensure webhook is configured correctly
- Test with different card numbers

### Issue: "CORS error in frontend"

**Solution:**
```typescript
// backend/src/app.ts
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

---

## 📚 Additional Resources

- **Stripe Docs:** https://stripe.com/docs
- **API Reference:** https://stripe.com/docs/api
- **React Integration:** https://stripe.com/docs/stripe-js/react
- **Test Cards:** https://stripe.com/docs/testing
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## 🎯 Next Steps

1. ✅ **Get Stripe API keys** from dashboard
2. ✅ **Configure `.env`** with your keys
3. ✅ **Install dependencies** (`stripe`, `@stripe/stripe-js`)
4. ✅ **Register routes** in `app.ts`
5. ✅ **Test with Postman** using test cards
6. ⏳ **Create payment form** component (see Frontend Integration)
7. ⏳ **Setup webhooks** for production
8. ⏳ **Test end-to-end** payment flow
9. ⏳ **Add error handling** and user feedback
10. ⏳ **Deploy with HTTPS** for production

---

**Created:** January 2025  
**Status:** Implementation Complete ✅  
**Progress:** Backend 100%, Frontend Pending

