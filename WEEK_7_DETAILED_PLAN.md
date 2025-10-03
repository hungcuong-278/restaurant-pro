# WEEK 7: ORDER MANAGEMENT & PAYMENT SYSTEM - KẾ HOẠCH CHI TIẾT 💳🍽️

**Ngày tạo:** 4 tháng 10, 2025  
**Mục tiêu chính:** Xây dựng hệ thống quản lý đơn hàng và thanh toán hoàn chỉnh  
**Thời gian dự kiến:** 8 ngày làm việc  
**Trạng thái:** 🟡 Đang lên kế hoạch

---

## 📊 TỔNG QUAN DỰ ÁN

### 🎯 Mục Tiêu Chính

1. **Hệ Thống Đơn Hàng (Order Management)**
   - Tạo đơn hàng cho bàn (dine-in)
   - Quản lý trạng thái đơn hàng
   - Thêm/xóa/sửa món trong đơn
   - Tính toán tự động (subtotal, tax, tip, total)

2. **Hệ Thống Thanh Toán (Payment System)**
   - Thanh toán tiền mặt
   - Thanh toán thẻ (Stripe)
   - Chia bill (split payment)
   - In hóa đơn/receipt

3. **Kitchen Display System (KDS)**
   - Màn hình hiển thị đơn cho bếp
   - Cập nhật trạng thái món ăn
   - Thông báo real-time

4. **Order Analytics**
   - Doanh thu theo ngày/tuần/tháng
   - Món ăn bán chạy
   - Hiệu suất nhân viên

---

## 🗓️ KẾ HOẠCH THỰC HIỆN CHI TIẾT

## **PHASE 1: ORDER BACKEND FOUNDATION** 
### ⏱️ Thời gian: Ngày 1-2 (16 giờ)

### 📌 Task 1.1: Order Service Layer
**Thời gian:** 4 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Mục tiêu
- Tạo service xử lý business logic cho orders
- Implement tất cả CRUD operations
- Validation và error handling

#### Công việc cụ thể
```typescript
// File: backend/src/services/orderService.ts

1. Tạo interface OrderCreateData
2. Implement createOrder(data)
   - Generate unique order_number (ORD-YYYYMMDD-XXX)
   - Validate restaurant_id, table_id
   - Calculate totals (subtotal, tax, tip, total)
   - Insert order và order_items trong transaction

3. Implement getOrderById(orderId)
   - Join với tables, users, menu_items
   - Include order_items với item details

4. Implement getOrdersByRestaurant(restaurantId, filters)
   - Filter by status, date, table
   - Pagination support
   - Sort by created_at DESC

5. Implement updateOrderStatus(orderId, newStatus)
   - Validate status transition
   - Update timestamps (confirmed_at, ready_at, etc.)

6. Implement addOrderItem(orderId, itemData)
   - Validate menu_item_id exists
   - Recalculate order totals

7. Implement removeOrderItem(orderId, itemId)
   - Delete item
   - Recalculate order totals

8. Implement updateOrderItem(orderId, itemId, updates)
   - Update quantity or special_instructions
   - Recalculate totals

9. Implement cancelOrder(orderId)
   - Set status to 'cancelled'
   - Prevent cancellation if already paid
```

#### Validation Rules
```typescript
- order_type: ['dine_in', 'takeout', 'delivery']
- status: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']
- quantity: >= 1
- amounts: >= 0
- tax_rate: 8.5% (configurable)
```

#### Testing
- [ ] Create order with valid data → Success
- [ ] Create order with invalid table → Error
- [ ] Add item to order → Totals recalculated
- [ ] Remove item from order → Totals updated
- [ ] Cancel paid order → Error

---

### 📌 Task 1.2: Order Controller & Routes
**Thời gian:** 3 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: backend/src/controllers/orderController.ts

1. createOrder(req, res)
   - Validate request body
   - Call orderService.createOrder()
   - Return 201 with order data

2. getOrders(req, res)
   - Parse query filters (status, date, table_id)
   - Call orderService.getOrdersByRestaurant()
   - Return paginated results

3. getOrder(req, res)
   - Get orderId from params
   - Call orderService.getOrderById()
   - Return 404 if not found

4. updateOrderStatus(req, res)
   - Validate status value
   - Call orderService.updateOrderStatus()
   - Emit socket event 'order:status_updated'

5. addItemToOrder(req, res)
   - Validate item data
   - Call orderService.addOrderItem()
   - Emit socket event 'order:item_added'

6. removeItemFromOrder(req, res)
   - Call orderService.removeOrderItem()
   - Emit socket event 'order:item_removed'

7. cancelOrder(req, res)
   - Call orderService.cancelOrder()
   - Emit socket event 'order:cancelled'
```

#### Routes
```typescript
// File: backend/src/routes/orderRoutes.ts

POST   /api/restaurants/:restaurantId/orders
GET    /api/restaurants/:restaurantId/orders
GET    /api/orders/:orderId
PATCH  /api/orders/:orderId/status
POST   /api/orders/:orderId/items
PATCH  /api/orders/:orderId/items/:itemId
DELETE /api/orders/:orderId/items/:itemId
DELETE /api/orders/:orderId
```

#### Testing với Postman
```bash
# 1. Create order
POST http://localhost:5000/api/restaurants/{restaurantId}/orders
Body: {
  "table_id": "...",
  "order_type": "dine_in",
  "items": [
    {"menu_item_id": "...", "quantity": 2, "special_instructions": "No salt"}
  ],
  "customer_notes": "Birthday celebration"
}

# 2. Get orders
GET http://localhost:5000/api/restaurants/{restaurantId}/orders?status=pending

# 3. Update status
PATCH http://localhost:5000/api/orders/{orderId}/status
Body: {"status": "preparing"}
```

---

### 📌 Task 1.3: Order Number Generator
**Thời gian:** 1 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: backend/src/utils/orderNumberGenerator.ts

export const generateOrderNumber = async (restaurantId: string): Promise<string> => {
  // Format: ORD-YYYYMMDD-001
  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');
  const prefix = `ORD-${dateStr}`;
  
  // Get last order number for today
  const lastOrder = await db('orders')
    .where('order_number', 'like', `${prefix}%`)
    .orderBy('order_number', 'desc')
    .first();
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.order_number.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${sequence.toString().padStart(3, '0')}`;
};
```

#### Testing
- [ ] First order of day → ORD-20251004-001
- [ ] Second order → ORD-20251004-002
- [ ] Order from different day → ORD-20251005-001

---

### 📌 Task 1.4: Tax & Total Calculator
**Thời gian:** 2 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: backend/src/utils/orderCalculator.ts

interface OrderCalculationResult {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
}

export const calculateOrderTotals = (
  items: OrderItem[],
  discountPercent: number = 0,
  tipPercent: number = 0,
  taxRate: number = 0.085  // 8.5% default
): OrderCalculationResult => {
  // 1. Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.item_price * item.quantity);
  }, 0);
  
  // 2. Calculate discount
  const discount_amount = subtotal * (discountPercent / 100);
  
  // 3. Calculate tax (on subtotal - discount)
  const taxableAmount = subtotal - discount_amount;
  const tax_amount = taxableAmount * taxRate;
  
  // 4. Calculate tip (on subtotal before tax)
  const tip_amount = subtotal * (tipPercent / 100);
  
  // 5. Calculate total
  const total_amount = subtotal - discount_amount + tax_amount + tip_amount;
  
  return {
    subtotal: roundToTwo(subtotal),
    tax_amount: roundToTwo(tax_amount),
    discount_amount: roundToTwo(discount_amount),
    tip_amount: roundToTwo(tip_amount),
    total_amount: roundToTwo(total_amount)
  };
};

const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};
```

#### Test Cases
```typescript
// Input: 
items = [
  { item_price: 25.00, quantity: 2 },  // $50.00
  { item_price: 15.00, quantity: 1 }   // $15.00
]
discount = 10%
tip = 18%
tax = 8.5%

// Expected Output:
subtotal = $65.00
discount_amount = $6.50
taxable = $58.50
tax_amount = $4.97
tip_amount = $11.70
total_amount = $75.17
```

---

### 📌 Task 1.5: Database Migration Check
**Thời gian:** 1 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
1. **Kiểm tra migration 003 đã chạy chưa**
   ```bash
   npm run migrate:latest
   ```

2. **Verify tables tồn tại**
   ```sql
   SELECT name FROM sqlite_master WHERE type='table';
   -- Expected: orders, order_items, payments
   ```

3. **Test insert data**
   ```sql
   INSERT INTO orders (id, restaurant_id, order_number, order_type, status) 
   VALUES (
     '550e8400-e29b-41d4-a716-446655440000',
     'e4e7bcd3-3b50-47ba-8abc-3597170677bb',
     'ORD-20251004-001',
     'dine_in',
     'pending'
   );
   ```

4. **Nếu có lỗi, kiểm tra:**
   - Foreign key constraints
   - UUID generation
   - Default values
   - Indexes

---

### 📌 Task 1.6: Error Handling & Logging
**Thời gian:** 2 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: backend/src/utils/orderErrors.ts

export class OrderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

export const ORDER_ERRORS = {
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    message: 'Order not found',
    status: 404
  },
  INVALID_STATUS: {
    code: 'INVALID_STATUS',
    message: 'Invalid order status',
    status: 400
  },
  CANNOT_MODIFY_PAID: {
    code: 'CANNOT_MODIFY_PAID',
    message: 'Cannot modify paid order',
    status: 403
  },
  INVALID_ITEM: {
    code: 'INVALID_ITEM',
    message: 'Menu item not found or unavailable',
    status: 400
  },
  CALCULATION_ERROR: {
    code: 'CALCULATION_ERROR',
    message: 'Order calculation failed',
    status: 500
  }
};
```

#### Logging Strategy
```typescript
// Use Winston or console with structured logs
console.log({
  timestamp: new Date().toISOString(),
  level: 'info',
  action: 'create_order',
  restaurantId,
  orderId,
  items_count: items.length,
  total: totals.total_amount
});
```

---

### 📌 Task 1.7: Initial Backend Testing
**Thời gian:** 3 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Test Scenarios
```typescript
// File: backend/test-order-api.js

1. Test Order Creation
   - Create order with 3 items
   - Verify order_number format
   - Verify totals calculation
   - Check order_items inserted

2. Test Get Order
   - Get by ID
   - Verify joins (table, items, menu)
   - Check all fields present

3. Test Update Status
   - pending → confirmed ✓
   - confirmed → cancelled ✓
   - cancelled → confirmed ✗ (should fail)

4. Test Add Item
   - Add item to existing order
   - Verify totals recalculated
   - Check item_price snapshot

5. Test Remove Item
   - Remove item from order
   - Verify totals updated
   - Cannot remove if order completed

6. Test Error Cases
   - Invalid restaurant_id → 404
   - Invalid menu_item_id → 400
   - Modify cancelled order → 403
   - Negative quantity → 400
```

#### Manual Testing với Postman Collection
Tạo collection với tất cả endpoints và test cases

---

## **PHASE 2: PAYMENT SYSTEM BACKEND**
### ⏱️ Thời gian: Ngày 3-4 (16 giờ)

### 📌 Task 2.1: Payment Service Layer
**Thời gian:** 4 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: backend/src/services/paymentService.ts

1. createPayment(orderId, paymentData)
   - Validate order exists and unpaid
   - Insert payment record
   - Update order payment status
   - Return payment details

2. getOrderPayments(orderId)
   - Get all payments for order
   - Calculate total paid
   - Return payment history

3. processCashPayment(orderId, amount, cashReceived)
   - Create payment record
   - Calculate change
   - Mark order as paid

4. processCardPayment(orderId, amount, cardDetails)
   - Integrate with Stripe (Phase 2.2)
   - Create payment record
   - Handle success/failure

5. splitPayment(orderId, splits)
   - Validate total matches order
   - Create multiple payment records
   - Support different methods per split

6. refundPayment(paymentId, amount)
   - Validate payment exists
   - Create refund record
   - Update payment status
   - Update order if full refund
```

---

### 📌 Task 2.2: Stripe Integration (Optional - Nếu có thời gian)
**Thời gian:** 6 giờ  
**Ưu tiên:** 🟢 Thấp (Có thể làm sau)  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Setup
```bash
npm install stripe @stripe/stripe-js
```

#### Backend Integration
```typescript
// File: backend/src/config/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// File: backend/src/services/stripeService.ts

export const createPaymentIntent = async (amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true
    }
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
};

export const confirmPayment = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};
```

**LƯU Ý:** Nếu chưa có Stripe account, có thể skip phần này và chỉ làm cash payment trước.

---

### 📌 Task 2.3: Payment Controller & Routes
**Thời gian:** 3 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Routes
```typescript
// File: backend/src/routes/paymentRoutes.ts

POST   /api/orders/:orderId/payments/cash
POST   /api/orders/:orderId/payments/card
POST   /api/orders/:orderId/payments/split
GET    /api/orders/:orderId/payments
POST   /api/payments/:paymentId/refund
```

#### Controllers
```typescript
// File: backend/src/controllers/paymentController.ts

1. processCashPayment(req, res)
   - Get orderId, amount, cash_received
   - Call paymentService.processCashPayment()
   - Return payment and change amount

2. processCardPayment(req, res)
   - Get orderId, amount, payment_method_id
   - Create Stripe payment intent
   - Return client_secret for frontend

3. processSplitPayment(req, res)
   - Get orderId, splits array
   - Validate total matches order
   - Process each payment
   - Return all payment records

4. getOrderPayments(req, res)
   - Get orderId from params
   - Return payment history

5. refundPayment(req, res)
   - Get paymentId, refund_amount
   - Process refund
   - Return refund details
```

---

### 📌 Task 2.4: Split Bill Logic
**Thời gian:** 2 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Implementation
```typescript
// File: backend/src/utils/billSplitter.ts

interface SplitPayment {
  person_name?: string;
  amount: number;
  payment_method: string;
}

export const validateSplitPayments = (
  orderTotal: number,
  splits: SplitPayment[]
): { valid: boolean; error?: string } => {
  // 1. Check total matches
  const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
  if (Math.abs(splitTotal - orderTotal) > 0.01) {
    return {
      valid: false,
      error: `Split total ($${splitTotal}) does not match order total ($${orderTotal})`
    };
  }
  
  // 2. Check all amounts positive
  if (splits.some(s => s.amount <= 0)) {
    return { valid: false, error: 'All amounts must be positive' };
  }
  
  // 3. Check payment methods valid
  const validMethods = ['cash', 'card', 'mobile'];
  if (splits.some(s => !validMethods.includes(s.payment_method))) {
    return { valid: false, error: 'Invalid payment method' };
  }
  
  return { valid: true };
};

export const splitBillEqually = (
  total: number,
  numPeople: number
): number[] => {
  const perPerson = Math.floor((total / numPeople) * 100) / 100;
  const remainder = Math.round((total - (perPerson * numPeople)) * 100) / 100;
  
  const splits = Array(numPeople).fill(perPerson);
  splits[0] += remainder; // First person pays remainder
  
  return splits;
};
```

---

### 📌 Task 2.5: Payment Testing
**Thời gian:** 1 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Test Cases
```javascript
// File: backend/test-payment-api.js

1. Cash Payment
   POST /api/orders/{orderId}/payments/cash
   Body: {
     "amount": 75.17,
     "cash_received": 100.00
   }
   Expected: {
     "payment_id": "...",
     "change": 24.83,
     "status": "completed"
   }

2. Split Payment
   POST /api/orders/{orderId}/payments/split
   Body: {
     "splits": [
       {"person_name": "John", "amount": 37.58, "payment_method": "cash"},
       {"person_name": "Jane", "amount": 37.59, "payment_method": "card"}
     ]
   }

3. Get Payment History
   GET /api/orders/{orderId}/payments
   Expected: Array of payments with timestamps

4. Error Cases
   - Pay cancelled order → 400
   - Split total mismatch → 400
   - Pay already paid order → 400
```

---

## **PHASE 3: ORDER FRONTEND (POS Interface)**
### ⏱️ Thời gian: Ngày 5-6 (16 giờ)

### 📌 Task 3.1: Redux Store Setup
**Thời gian:** 2 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: frontend/src/store/slices/orderSlice.ts

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    table_id: string | null;
    date_from: string | null;
    date_to: string | null;
  };
}

// Actions:
- fetchOrders(restaurantId, filters)
- fetchOrderById(orderId)
- createOrder(orderData)
- updateOrderStatus(orderId, status)
- addOrderItem(orderId, itemData)
- removeOrderItem(orderId, itemId)
- cancelOrder(orderId)
- clearCurrentOrder()
```

---

### 📌 Task 3.2: Order Service (API Client)
**Thời gian:** 2 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Công việc cụ thể
```typescript
// File: frontend/src/services/orderService.ts

export const orderService = {
  async createOrder(restaurantId: string, orderData: CreateOrderData) {
    const response = await api.post(
      `/restaurants/${restaurantId}/orders`,
      orderData
    );
    return response.data;
  },
  
  async getOrders(restaurantId: string, filters?: OrderFilters) {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(
      `/restaurants/${restaurantId}/orders?${params}`
    );
    return response.data;
  },
  
  async getOrderById(orderId: string) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  async updateStatus(orderId: string, status: string) {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },
  
  async addItem(orderId: string, itemData: OrderItemData) {
    const response = await api.post(`/orders/${orderId}/items`, itemData);
    return response.data;
  },
  
  async removeItem(orderId: string, itemId: string) {
    const response = await api.delete(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  }
};
```

---

### 📌 Task 3.3: Create Order Page (POS Interface)
**Thời gian:** 6 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Component Structure
```
frontend/src/pages/orders/
├── CreateOrderPage.tsx       # Main POS interface
└── OrderManagementPage.tsx   # List all orders

frontend/src/components/orders/
├── TableSelector.tsx          # Select table for dine-in
├── MenuItemGrid.tsx          # Display menu items in grid
├── OrderItemsList.tsx        # Current order items
├── OrderSummary.tsx          # Totals calculation
└── OrderActions.tsx          # Submit/Cancel buttons
```

#### CreateOrderPage Design
```typescript
// File: frontend/src/pages/orders/CreateOrderPage.tsx

Layout:
┌────────────────────────────────────────────────────────┐
│ 🍽️ New Order                          Table: [5 ▼]  │
├─────────────────────┬──────────────────────────────────┤
│                     │                                  │
│  MENU ITEMS         │  ORDER ITEMS                     │
│  (Grid view)        │  (List view)                     │
│                     │                                  │
│  🥗 Salads          │  2x Grilled Salmon      $50.00  │
│  🥩 Main Courses    │     └ No lemon                   │
│  🍰 Desserts        │  1x Caesar Salad        $14.00  │
│  🍷 Beverages       │  3x Iced Tea            $12.00  │
│                     │                                  │
│  [Search...]        │  ──────────────────────────────  │
│                     │  Subtotal:              $76.00  │
│                     │  Tax (8.5%):            $6.46   │
│                     │  Total:                 $82.46  │
│                     │                                  │
│                     │  [Clear] [Submit Order]          │
└─────────────────────┴──────────────────────────────────┘
```

#### Key Features
1. **Table Selection**
   - Dropdown with available tables
   - Show table capacity
   - Highlight occupied tables

2. **Menu Items Grid**
   - Category tabs (Salads, Main, Desserts, Drinks)
   - Image, name, price for each item
   - Click to add to order
   - Search filter

3. **Order Items List**
   - Editable quantity
   - Remove button
   - Special instructions input
   - Real-time total calculation

4. **Order Summary**
   - Subtotal, Tax, Tip (optional), Total
   - Tax rate configurable
   - Tip percentage buttons (15%, 18%, 20%)

5. **Actions**
   - Submit Order → Create order API call
   - Clear → Reset form
   - Save Draft → Store in localStorage

---

### 📌 Task 3.4: Order Management Page
**Thời gian:** 4 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Design
```typescript
// File: frontend/src/pages/orders/OrderManagementPage.tsx

┌─────────────────────────────────────────────────────────┐
│ 📋 Orders                                               │
├─────────────────────────────────────────────────────────┤
│ Filters: [All ▼] [Today ▼] [Table ▼]     [Search...]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  #ORD-20251004-001    Table 5    🟡 Preparing   $82.46│
│  2 items  •  15 min ago  •  John Doe                  │
│  [View] [Update Status] [Print]                        │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  #ORD-20251004-002    Table 3    🟢 Ready      $125.30│
│  5 items  •  10 min ago  •  Jane Smith                │
│  [View] [Update Status] [Print]                        │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  #ORD-20251004-003    Takeout    ⚪ Pending    $45.20│
│  3 items  •  Just now  •  Bob Johnson                 │
│  [View] [Update Status] [Print]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Features
1. **Filters**
   - Status: All, Pending, Preparing, Ready, Served, Completed
   - Date: Today, This Week, Custom Range
   - Table: All Tables, or specific table
   - Order Type: All, Dine-in, Takeout, Delivery

2. **Order Cards**
   - Order number, table, status badge
   - Item count, time since order
   - Customer name (if available)
   - Total amount

3. **Actions**
   - View Details → Modal with full order
   - Update Status → Dropdown to change
   - Print → Print receipt

4. **Real-time Updates**
   - WebSocket listener for order updates
   - Auto-refresh order list
   - Notification sound for new orders

---

### 📌 Task 3.5: Order Components
**Thời gian:** 2 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Components
```typescript
// 1. OrderStatusBadge.tsx
Status badges với màu sắc:
- Pending: ⚪ Gray
- Confirmed: 🔵 Blue
- Preparing: 🟡 Yellow
- Ready: 🟢 Green
- Served: 🔵 Blue
- Completed: ✅ Green
- Cancelled: 🔴 Red

// 2. OrderDetailsModal.tsx
Modal hiển thị full order details:
- Order info (number, table, time)
- Customer info
- All items with prices
- Status timeline
- Payment status
- Actions (update, print, cancel)

// 3. MenuItemCard.tsx
Card hiển thị menu item:
- Image placeholder
- Item name
- Category badge
- Price
- Add button
- Available/Unavailable status

// 4. OrderItemRow.tsx
Row hiển thị item trong order:
- Item name
- Quantity input
- Unit price
- Total price
- Special instructions
- Remove button
```

---

## **PHASE 4: PAYMENT FRONTEND & CHECKOUT**
### ⏱️ Thời gian: Ngày 7-8 (16 giờ)

### 📌 Task 4.1: Payment Redux Store
**Thời gian:** 1 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

```typescript
// File: frontend/src/store/slices/paymentSlice.ts

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
}

// Actions:
- fetchOrderPayments(orderId)
- processCashPayment(orderId, data)
- processCardPayment(orderId, data)
- processSplitPayment(orderId, splits)
- refundPayment(paymentId, amount)
```

---

### 📌 Task 4.2: Payment Service
**Thời gian:** 1 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

```typescript
// File: frontend/src/services/paymentService.ts

export const paymentService = {
  async processCash(orderId: string, data: CashPaymentData) {
    return await api.post(`/orders/${orderId}/payments/cash`, data);
  },
  
  async processCard(orderId: string, data: CardPaymentData) {
    return await api.post(`/orders/${orderId}/payments/card`, data);
  },
  
  async processSplit(orderId: string, splits: SplitPayment[]) {
    return await api.post(`/orders/${orderId}/payments/split`, { splits });
  },
  
  async getPayments(orderId: string) {
    return await api.get(`/orders/${orderId}/payments`);
  }
};
```

---

### 📌 Task 4.3: Checkout Page
**Thời g间:** 6 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Design
```typescript
// File: frontend/src/pages/checkout/CheckoutPage.tsx

┌─────────────────────────────────────────────────────────┐
│ 💳 Payment - Order #ORD-20251004-001                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ORDER SUMMARY                                          │
│  ─────────────────────────────────────────────────────  │
│  2x Grilled Salmon                          $50.00     │
│  1x Caesar Salad                            $14.00     │
│  3x Iced Tea                                $12.00     │
│  ─────────────────────────────────────────────────────  │
│  Subtotal:                                  $76.00     │
│  Tax (8.5%):                                $6.46      │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  💰 ADD TIP (Optional)                                 │
│  [15%] [18%] [20%] [Custom]     Tip: $13.68          │
│  ─────────────────────────────────────────────────────  │
│  TOTAL TO PAY:                    $96.14 USD          │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  PAYMENT METHOD                                         │
│  ○ Cash                                                │
│  ○ Card                                                │
│  ○ Split Bill                                          │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Cancel] [Process Payment]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Features
1. **Order Summary**
   - Display all items with prices
   - Show calculations clearly
   - Readonly (can't modify at checkout)

2. **Tip Calculator**
   - Percentage buttons (15%, 18%, 20%)
   - Custom amount input
   - Real-time total update
   - Optional (can skip)

3. **Payment Method Selection**
   - Radio buttons: Cash, Card, Split
   - Show different forms based on selection

4. **Cash Payment Form**
   ```
   Amount Due: $96.14
   Cash Received: [$______]
   Change: $0.00 (auto-calculated)
   ```

5. **Card Payment Form** (if Stripe integrated)
   - Stripe Elements card input
   - Cardholder name
   - Process with Stripe

6. **Split Bill Form**
   - Number of people selector
   - Equal split or custom amounts
   - Payment method per person

---

### 📌 Task 4.4: Payment Components
**Thời gian:** 4 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Components
```typescript
// 1. TipCalculator.tsx
interface TipCalculatorProps {
  subtotal: number;
  onTipChange: (tip: number) => void;
}

// Features:
- Percentage buttons (15%, 18%, 20%, 25%)
- Custom amount input
- No tip button
- Display calculated tip amount

// 2. CashPaymentForm.tsx
- Amount due display (large, bold)
- Cash received input
- Change calculation (real-time)
- Submit button

// 3. SplitBillForm.tsx
- Number of people input (2-10)
- Split method: Equal or Custom
- If equal: Show amount per person
- If custom: Input fields for each person
- Payment method selector per person
- Total validation (must match order total)

// 4. PaymentSummary.tsx
- Order details
- Payment breakdown
- Tip amount
- Total paid
- Payment method
- Timestamp
- Print receipt button

// 5. ReceiptView.tsx
- Restaurant info
- Order number, date, time
- Table number
- All items with prices
- Calculations
- Payment info
- Thank you message
- Printable format
```

---

### 📌 Task 4.5: Receipt Generator
**Thời gian:** 2 giờ  
**Ưu tiên:** 🟡 Trung bình  
**Trạng thái:** ⏳ Chưa bắt đầu

```typescript
// File: frontend/src/utils/receiptGenerator.ts

export const generateReceipt = (order: Order, payment: Payment) => {
  return `
    ╔════════════════════════════════════╗
    ║      RESTAURANT PRO                ║
    ║   123 Main Street, City, State     ║
    ║   Phone: (555) 123-4567            ║
    ╠════════════════════════════════════╣
    
    Order #: ${order.order_number}
    Date: ${formatDate(order.created_at)}
    Table: ${order.table_number}
    Server: ${order.staff_name}
    
    ────────────────────────────────────
    ITEMS
    ────────────────────────────────────
    ${order.items.map(item => `
    ${item.quantity}x ${item.item_name}
       ${formatPrice(item.total_price)}
    ${item.special_instructions ? `   Note: ${item.special_instructions}` : ''}
    `).join('\n')}
    
    ────────────────────────────────────
    Subtotal:        ${formatPrice(order.subtotal)}
    Tax (8.5%):      ${formatPrice(order.tax_amount)}
    Tip:             ${formatPrice(order.tip_amount)}
    ────────────────────────────────────
    TOTAL:           ${formatPrice(order.total_amount)}
    
    Payment Method: ${payment.payment_method}
    ${payment.payment_method === 'cash' ? 
      `Cash Received: ${formatPrice(payment.cash_received)}
       Change: ${formatPrice(payment.change)}` : ''}
    
    ────────────────────────────────────
    Thank you for dining with us!
    Visit us again soon!
    
    ╚════════════════════════════════════╝
  `;
};
```

---

### 📌 Task 4.6: Payment Success Flow
**Thời gian:** 2 giờ  
**Ưu tiên:** 🔴 Cao  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Flow
```
1. User clicks "Process Payment"
   ↓
2. Validate form
   ↓
3. Show loading spinner
   ↓
4. Call payment API
   ↓
5. If Success:
   - Show success message
   - Display receipt
   - Offer to print
   - Update order status
   - Redirect to order list after 5 seconds
   
6. If Error:
   - Show error message
   - Keep form data
   - Allow retry
```

#### Success Page
```typescript
// File: frontend/src/pages/checkout/PaymentSuccessPage.tsx

┌─────────────────────────────────────────┐
│  ✅ Payment Successful!                 │
├─────────────────────────────────────────┤
│                                         │
│  Order #ORD-20251004-001                │
│  Amount Paid: $96.14                    │
│  Payment Method: Cash                   │
│  Change Given: $3.86                    │
│                                         │
│  [View Receipt] [Print Receipt]         │
│  [Back to Orders]                       │
│                                         │
│  Redirecting in 5 seconds...            │
│                                         │
└─────────────────────────────────────────┘
```

---

## **PHASE 5: KITCHEN DISPLAY SYSTEM (Optional - Nếu còn thời gian)**
### ⏱️ Thời gian: Bonus time (8 giờ)

### 📌 Task 5.1: Kitchen Display Page
**Thời gian:** 4 giờ  
**Ưu tiên:** 🟢 Thấp  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Design
```
Grid layout with order cards
Auto-refresh every 5 seconds
Color-coded by urgency (time since ordered)
Sound alerts for new orders
Item-level status updates
```

### 📌 Task 5.2: Real-time Updates (WebSocket)
**Thời gian:** 4 giờ  
**Ưu tiên:** 🟢 Thấp  
**Trạng thái:** ⏳ Chưa bắt đầu

#### Implementation
```typescript
// Socket events:
- order:created
- order:status_updated
- order:item_status_updated
```

---

## 🎯 ĐỊNH NGHĨA HOÀN THÀNH (Definition of Done)

### Backend
- [ ] All order endpoints working
- [ ] Payment processing functional
- [ ] Database migrations run successfully
- [ ] Error handling implemented
- [ ] API tested with Postman
- [ ] Order calculations accurate
- [ ] Logging in place

### Frontend
- [ ] Create order page complete
- [ ] Order management page working
- [ ] Checkout/payment flow functional
- [ ] Receipt generation working
- [ ] Redux state management stable
- [ ] UI responsive and user-friendly
- [ ] Error messages helpful
- [ ] Loading states shown

### Integration
- [ ] Frontend calls backend APIs successfully
- [ ] Payment flow end-to-end works
- [ ] Order creation → Payment → Completion works
- [ ] Data validation on both sides
- [ ] No console errors
- [ ] Cross-browser tested

---

## 📊 METRICS & SUCCESS CRITERIA

### Performance
- Order creation: < 2 seconds
- Payment processing: < 3 seconds
- Page load time: < 1 second
- API response time: < 500ms

### Quality
- Zero calculation errors
- 100% payment accuracy
- Clear error messages
- Intuitive UI flow
- Mobile responsive

### Business
- Can process 50+ orders per day
- Support multiple payment methods
- Accurate financial reporting
- Reduce order errors by 80%
- Improve table turnover time

---

## 🚨 RISKS & MITIGATION

### Risks
1. **Stripe Integration Complexity**
   - Mitigation: Start with cash payment only, add Stripe later

2. **Calculation Errors**
   - Mitigation: Extensive testing with various scenarios

3. **Real-time Updates Performance**
   - Mitigation: WebSocket optional, start with polling

4. **Time Constraints**
   - Mitigation: Prioritize core features, skip optional ones

### Backup Plan
If running out of time, minimum viable features:
1. Create order (dine-in only)
2. Cash payment only
3. Basic order list
4. No kitchen display
5. No split payment

---

## 📝 DAILY CHECKLIST

### Day 1: Order Backend Part 1
- [ ] Setup orderService.ts
- [ ] Implement createOrder
- [ ] Implement getOrders
- [ ] Test with Postman

### Day 2: Order Backend Part 2
- [ ] Implement update/delete operations
- [ ] Add item operations
- [ ] Calculator utils
- [ ] Full backend testing

### Day 3: Payment Backend Part 1
- [ ] Setup paymentService.ts
- [ ] Implement cash payment
- [ ] Test payment flow

### Day 4: Payment Backend Part 2
- [ ] Implement split payment
- [ ] (Optional) Stripe integration
- [ ] Payment testing

### Day 5: Order Frontend Part 1
- [ ] Redux setup
- [ ] Order service client
- [ ] Create order page layout

### Day 6: Order Frontend Part 2
- [ ] Complete create order page
- [ ] Order management page
- [ ] Components

### Day 7: Payment Frontend Part 1
- [ ] Payment Redux setup
- [ ] Checkout page layout
- [ ] Cash payment form

### Day 8: Payment Frontend Part 2
- [ ] Complete checkout flow
- [ ] Receipt generator
- [ ] Integration testing
- [ ] Bug fixes

---

## 🎉 COMPLETION CRITERIA

Week 7 is considered **COMPLETE** when:

✅ **Backend (100%)**
- [ ] Can create orders via API
- [ ] Can update order status
- [ ] Can add/remove items
- [ ] Can process cash payments
- [ ] Can process split payments
- [ ] All calculations accurate

✅ **Frontend (100%)**
- [ ] Can create order via UI
- [ ] Can view all orders
- [ ] Can update order status
- [ ] Can process payment
- [ ] Can view receipt
- [ ] UI looks professional

✅ **Integration (100%)**
- [ ] End-to-end flow works
- [ ] No critical bugs
- [ ] Data persists correctly
- [ ] Error handling works

✅ **Documentation (100%)**
- [ ] API endpoints documented
- [ ] User guide created
- [ ] Completion report written
- [ ] Git commits organized

---

## 📚 RESOURCES & REFERENCES

### Documentation
- Stripe API: https://stripe.com/docs/api
- React Redux: https://react-redux.js.org/
- TypeScript: https://www.typescriptlang.org/
- Knex.js: http://knexjs.org/

### Design Inspiration
- Square POS interface
- Toast POS system
- Shopify POS

### Testing Tools
- Postman for API testing
- Chrome DevTools for debugging
- React DevTools for state inspection

---

## 🚀 NEXT STEPS AFTER WEEK 7

### Week 8 Preview: Staff & Inventory Management
1. **Staff Management**
   - Employee profiles
   - Role-based permissions
   - Shift scheduling
   - Performance tracking

2. **Inventory System**
   - Stock tracking
   - Low stock alerts
   - Supplier management
   - Purchase orders

3. **Advanced Reports**
   - Sales reports
   - Inventory reports
   - Staff performance
   - Export to Excel/PDF

---

## 💡 TIPS & BEST PRACTICES

### Development Tips
1. **Test as you build** - Don't wait until the end
2. **Start simple** - Get basic flow working first
3. **Use TypeScript** - Catch errors early
4. **Handle errors gracefully** - Show helpful messages
5. **Keep UI responsive** - Show loading states

### Code Quality
1. **Consistent naming** - Follow conventions
2. **Comment complex logic** - Help future you
3. **DRY principle** - Don't repeat yourself
4. **Small functions** - Single responsibility
5. **Type safety** - Use interfaces/types

### Git Workflow
1. **Commit often** - Small, focused commits
2. **Descriptive messages** - Explain what and why
3. **Test before commit** - Don't break main branch
4. **Branch for features** - Keep main stable

---

**🎯 LET'S BUILD AN AMAZING ORDER & PAYMENT SYSTEM! 💪**

---

## 📞 SUPPORT & QUESTIONS

Nếu gặp vấn đề trong quá trình thực hiện:
1. Kiểm tra lại documentation
2. Debug với console.log
3. Test với Postman
4. Hỏi ChatGPT/Claude nếu cần
5. Tham khảo code examples

**Chúc bạn thành công với Week 7! 🚀**
