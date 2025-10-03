# Week 7: Order Management & Payment Processing 💳🍽️

## Overview
Week 7 focuses on building a comprehensive order management system with integrated payment processing, transforming the restaurant into a complete digital platform with seamless ordering, kitchen coordination, and payment workflows.

## 🎯 Main Objectives

### 🍽️ Order Management System
- **Order Creation**: Dine-in, takeout, and delivery orders
- **Kitchen Display**: Real-time order tracking for kitchen staff
- **Order Status**: Pending, preparing, ready, served, completed
- **Order Modifications**: Add/remove items, special instructions
- **Bill Splitting**: Multiple payment methods per order

### 💳 Payment Processing
- **Payment Gateway**: Stripe integration
- **Payment Methods**: Card, cash, digital wallets
- **Split Payments**: Divide bill among guests
- **Tips**: Gratuity calculation and processing
- **Receipts**: Digital receipts via email

### 📊 Order Analytics
- **Sales Dashboard**: Revenue, order count, average ticket
- **Popular Items**: Best-selling menu items
- **Peak Hours**: Busiest times and days
- **Server Performance**: Individual staff metrics

## 📋 Phase Breakdown

### Phase 1: Order System Backend (Days 1-2)

#### Database Schema
```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  table_id UUID REFERENCES tables(id),
  reservation_id UUID REFERENCES reservations(id),
  order_number VARCHAR(20) UNIQUE,
  order_type ENUM('dine-in', 'takeout', 'delivery'),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  notes TEXT,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  discount DECIMAL(10, 2),
  tip DECIMAL(10, 2),
  total DECIMAL(10, 2),
  payment_status ENUM('pending', 'paid', 'refunded'),
  payment_method VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  special_instructions TEXT,
  status ENUM('pending', 'preparing', 'ready', 'served'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2),
  payment_method ENUM('cash', 'card', 'digital_wallet'),
  payment_provider VARCHAR(50),
  transaction_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### API Endpoints
```typescript
// Order Management
POST   /api/restaurants/:restaurantId/orders          # Create order
GET    /api/restaurants/:restaurantId/orders          # List orders
GET    /api/orders/:orderId                           # Get order details
PATCH  /api/orders/:orderId/status                    # Update order status
PATCH  /api/orders/:orderId/items/:itemId             # Update item status
DELETE /api/orders/:orderId                           # Cancel order

// Kitchen Management
GET    /api/restaurants/:restaurantId/kitchen/orders  # Kitchen display orders
PATCH  /api/kitchen/orders/:orderId/items/:itemId     # Update item cooking status

// Payment Processing
POST   /api/orders/:orderId/payments                  # Create payment
GET    /api/orders/:orderId/payments                  # List payments
POST   /api/orders/:orderId/split-payment             # Split bill
POST   /api/orders/:orderId/refund                    # Process refund

// Analytics
GET    /api/restaurants/:restaurantId/analytics/sales # Sales analytics
GET    /api/restaurants/:restaurantId/analytics/items # Popular items
```

#### Service Layer
```typescript
// services/orderService.ts
- createOrder(data)
- getOrders(restaurantId, filters)
- getOrderById(orderId)
- updateOrderStatus(orderId, status)
- updateItemStatus(orderId, itemId, status)
- cancelOrder(orderId)
- calculateOrderTotal(items, tax, discount, tip)

// services/paymentService.ts
- createPayment(orderId, paymentData)
- processStripePayment(amount, paymentMethodId)
- splitPayment(orderId, splits)
- processRefund(paymentId, amount)
- getOrderPayments(orderId)

// services/kitchenService.ts
- getKitchenOrders(restaurantId)
- updateItemCookingStatus(itemId, status)
- getOrdersByStatus(status)
```

---

### Phase 2: Payment Gateway Integration (Days 3-4)

#### Stripe Setup
```typescript
// config/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Payment Intent creation
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd'
) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};
```

#### Payment Controller
```typescript
// controllers/paymentController.ts
export const createPayment = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { amount, paymentMethodId, tip } = req.body;

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((amount + tip) * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Save payment record
    const payment = await paymentService.createPayment({
      order_id: orderId,
      amount: amount + tip,
      payment_method: 'card',
      payment_provider: 'stripe',
      transaction_id: paymentIntent.id,
      status: 'completed',
    });

    // Update order payment status
    await orderService.updateOrderPaymentStatus(orderId, 'paid');

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

#### Webhook Handler
```typescript
// routes/webhookRoutes.ts
router.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }

    res.json({received: true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

### Phase 3: Order Management Frontend (Days 5-6)

#### Components Structure
```
frontend/src/components/orders/
├── OrderCard.tsx              # Order summary card
├── OrderDetails.tsx           # Full order details view
├── OrderItemsList.tsx         # List of items in order
├── OrderStatusBadge.tsx       # Status indicator
├── OrderActions.tsx           # Action buttons (edit, cancel, etc.)
├── CreateOrderModal.tsx       # Create new order form
└── OrderFilters.tsx           # Filter by status, date, type
```

#### Order Management Page
```typescript
// pages/orders/OrderManagementPage.tsx
- Display all orders in a table/grid
- Filter by status (pending, preparing, ready, etc.)
- Search by order number or customer
- Quick status updates
- Real-time updates via WebSocket
- Order details modal
- Print order/receipt

// pages/orders/CreateOrderPage.tsx
- Select table (for dine-in)
- Add menu items with quantities
- Special instructions per item
- Calculate totals (subtotal, tax, tip)
- Order type selection (dine-in/takeout/delivery)
- Submit order
```

#### Kitchen Display System
```typescript
// pages/kitchen/KitchenDisplayPage.tsx
- Grid layout of active orders
- Color-coded by urgency
- Timer showing order age
- Item-level status updates
- Sound alerts for new orders
- Completion confirmation
- Auto-refresh every 5 seconds
```

---

### Phase 4: Payment Interface (Days 7-8)

#### Payment Components
```typescript
// components/payment/
├── PaymentForm.tsx            # Card input form
├── PaymentMethodSelector.tsx  # Cash/Card/Wallet selection
├── TipCalculator.tsx          # Tip % buttons (15%, 18%, 20%, custom)
├── BillSummary.tsx           # Subtotal, tax, tip, total
├── SplitBillModal.tsx        # Divide bill among guests
└── ReceiptView.tsx           # Digital receipt display
```

#### Checkout Flow
```typescript
// pages/checkout/CheckoutPage.tsx
1. Display order summary
2. Tip selection (percentage or custom amount)
3. Payment method selection
4. For card payments:
   - Stripe Elements card input
   - Billing address
   - Submit payment
5. For cash payments:
   - Mark as cash payment
   - Optional change calculation
6. Payment confirmation
7. Generate receipt
8. Email receipt option
```

#### Stripe Elements Integration
```tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

export const PaymentPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent on mount
    const createIntent = async () => {
      const response = await paymentService.createPaymentIntent(orderTotal);
      setClientSecret(response.clientSecret);
    };
    createIntent();
  }, []);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
};
```

---

## 🎨 UI/UX Design

### Order Card Design
```typescript
┌─────────────────────────────────────┐
│ #12345        🕐 15 min ago    [🟢 Ready] │
├─────────────────────────────────────┤
│ Table 5 • 4 guests                  │
│                                      │
│ 2x Grilled Salmon  $36.00          │
│ 1x Caesar Salad    $14.00          │
│ 3x Iced Tea        $12.00          │
│                                      │
│ Subtotal:         $62.00           │
│ Tax:              $5.58            │
│ Total:            $67.58           │
├─────────────────────────────────────┤
│ [View Details] [Update Status] [Print]│
└─────────────────────────────────────┘
```

### Kitchen Display Card
```typescript
┌─────────────────────────────────┐
│ Order #12345        ⏱️ 15:30   │
│ Table 5                         │
├─────────────────────────────────┤
│ □ 2x Grilled Salmon            │
│   └ No lemon                    │
│ ✓ 1x Caesar Salad              │
│ □ 3x Iced Tea                  │
├─────────────────────────────────┤
│ [Mark Item Ready] [Complete]    │
└─────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Real-time Updates
```typescript
// WebSocket events
socket.on('order:created', (order) => {
  // Add new order to list
  // Play notification sound
  // Update kitchen display
});

socket.on('order:status_updated', ({ orderId, status }) => {
  // Update order status in UI
  // Refresh kitchen display if needed
});

socket.on('order:item_ready', ({ orderId, itemId }) => {
  // Mark item as ready
  // Check if all items ready → update order
});
```

### Bill Splitting Algorithm
```typescript
export const splitBill = (
  total: number,
  numPeople: number,
  method: 'equal' | 'custom'
) => {
  if (method === 'equal') {
    const perPerson = (total / numPeople).toFixed(2);
    return Array(numPeople).fill(parseFloat(perPerson));
  }
  // Custom split: Let each person enter their amount
  return [];
};
```

---

## 📊 Success Metrics

### Technical Goals
- ✅ Order creation < 30 seconds
- ✅ Payment processing < 5 seconds
- ✅ Real-time kitchen updates < 1 second
- ✅ 99.9% payment success rate
- ✅ Zero double-charge incidents

### Business Goals
- ✅ Reduce order errors by 50%
- ✅ Faster table turnover
- ✅ Increased tip averages
- ✅ Better kitchen coordination
- ✅ Improved customer satisfaction

---

## 🧪 Testing Plan

### Backend Testing
- [ ] Order CRUD operations
- [ ] Payment processing (Stripe test mode)
- [ ] Webhook handling
- [ ] Bill splitting logic
- [ ] Tax calculation accuracy
- [ ] Refund processing

### Frontend Testing
- [ ] Order creation flow
- [ ] Payment form validation
- [ ] Stripe Elements integration
- [ ] Kitchen display real-time updates
- [ ] Receipt generation
- [ ] Split payment UI

### Integration Testing
- [ ] End-to-end order → payment → completion
- [ ] Kitchen workflow
- [ ] Error handling (payment failures)
- [ ] WebSocket reconnection
- [ ] Receipt email delivery

---

## 🚀 Deployment Requirements

### Environment Variables
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Email (for receipts)
SMTP_HOST=smtp.gmail.com
SMTP_USER=receipts@restaurant.com
SMTP_PASS=...
```

### Stripe Setup
1. Create Stripe account
2. Get API keys (test mode)
3. Configure webhook endpoint
4. Set up payment methods
5. Test with test cards

---

## 📝 Next Steps After Week 7

### Week 8 Preview
- **Staff Management**: Employee scheduling, roles, permissions
- **Inventory System**: Stock tracking, low stock alerts
- **Reports**: Comprehensive business reports
- **Mobile App**: Native mobile application

---

**Week 7 Goal**: Transform Restaurant Pro into a complete order management and payment processing platform! 💳🍽️
