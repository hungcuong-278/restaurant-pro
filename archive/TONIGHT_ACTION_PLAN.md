# Week 8 - Remaining Tasks & Action Plan
**Date**: October 7, 2025, 11:45 PM
**Status**: Backend & Frontend running, Tests created

---

## ✅ Already Completed Tonight

1. **Test Infrastructure** ✅
   - 200+ automated test cases created
   - Jest configuration
   - Coverage reporting setup
   - Test runners created

2. **Backend & Frontend Running** ✅
   - Backend: http://localhost:5000 ✅
   - Frontend: http://localhost:3000 (starting...) ⏳

3. **Code Committed** ✅
   - 6 commits pushed to GitHub
   - All documentation updated

---

## 🎯 Priority Tasks - Next 2-3 Hours

### Priority 1: Complete Order Management (1.5 hours)

#### A. Add Real-time Order Updates
**File**: `frontend/src/pages/orders/KitchenViewPage.tsx`
**Status**: Has auto-refresh (30s), but could add WebSocket later
**Action**: ✅ Already implemented with auto-refresh

#### B. Add Print Functionality  
**Files to create/update**:
- `frontend/src/utils/printReceipt.ts` - Print utility
- `frontend/src/components/orders/PrintableReceipt.tsx` - Printable component
- Update `KitchenViewPage.tsx` - Add print button

**Implementation**:
```typescript
// Create print utility for kitchen orders
- Receipt format
- Order details
- Items list
- Special instructions
```

#### C. Order Status Flow Validation
**File**: `backend/src/services/orderService.ts`
**Add**: Status transition validation
```typescript
// Validate status transitions:
// pending -> confirmed -> preparing -> ready -> completed
// Any status -> cancelled (with reason)
```

---

### Priority 2: Payment Gateway Integration (1 hour)

#### A. Setup Payment Service
**File**: `backend/src/services/paymentService.ts`
**Status**: Basic structure exists
**Add**:
- Stripe integration (test mode)
- Payment intent creation
- Webhook handling
- Receipt generation

#### B. Frontend Payment Form
**Create**: `frontend/src/components/payments/PaymentForm.tsx`
**Features**:
- Credit card input (Stripe Elements)
- Payment validation
- Loading states
- Success/error handling

---

### Priority 3: Form Validation Improvements (30 min)

#### A. Reservation Form
**File**: `frontend/src/components/reservations/ReservationForm.tsx`
**Add**:
- Phone number format validation (Vietnamese format)
- Email format validation (better regex)
- Party size limits (1-20)
- Date/time validation (not in past, within business hours)

#### B. Order Form
**File**: `frontend/src/pages/orders/NewOrderPage.tsx`
**Add**:
- Item quantity validation (min 1, max 99)
- Special instructions character limit
- Table selection validation

---

## 🚀 Quick Wins - Next 30 Minutes

### 1. Add Missing Service Methods (15 min)
**Tests expect these methods:**

```typescript
// backend/src/services/menuService.ts
export interface MenuFilters {
  category?: string;
  available?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class MenuService {
  // Add wrapper method for tests
  async getMenu(filters?: MenuFilters) {
    return {
      success: true,
      items: await this.getMenuItems('default-restaurant', filters || {})
    };
  }
  
  // Add search functionality
  async searchMenu(query: string, restaurantId: string) {
    return this.getMenuItems(restaurantId, { search: query });
  }
}
```

### 2. Fix Test Compatibility (15 min)
**Create test adapter layer** to match test expectations with actual service API.

---

## 📋 Detailed Implementation Steps

### Step 1: Print Receipt Feature (30 min)

**1.1 Create Print Utility**
```typescript
// frontend/src/utils/printReceipt.ts
export const printKitchenReceipt = (order: Order) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(generateReceiptHTML(order));
  printWindow.print();
};
```

**1.2 Create Printable Component**
```typescript
// frontend/src/components/orders/PrintableReceipt.tsx
interface Props {
  order: Order;
}

export const PrintableReceipt: React.FC<Props> = ({ order }) => {
  return (
    <div className="print-only">
      <h2>Kitchen Order #{order.order_number}</h2>
      <p>Table: {order.table_number}</p>
      <p>Time: {formatTime(order.created_at)}</p>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            {item.quantity}x {item.name}
            {item.special_instructions && (
              <p>Note: {item.special_instructions}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**1.3 Add Print Button to Kitchen View**
```typescript
// In KitchenViewPage.tsx
<Button onClick={() => printKitchenReceipt(order)}>
  Print Order
</Button>
```

---

### Step 2: Status Transition Validation (20 min)

**File**: `backend/src/services/orderService.ts`

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['preparing', 'cancelled'],
  'preparing': ['ready', 'cancelled'],
  'ready': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': []
};

async updateOrderStatus(orderId: string, newStatus: string) {
  const order = await this.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  const validTransitions = VALID_TRANSITIONS[order.status];
  if (!validTransitions.includes(newStatus)) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }
  
  // Proceed with update...
}
```

---

### Step 3: Enhanced Form Validation (20 min)

**File**: `frontend/src/components/reservations/ReservationForm.tsx`

```typescript
const validatePhone = (phone: string): string | null => {
  // Vietnamese phone format: 10 digits, starts with 0
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Phone number must be 10 digits and start with 0';
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

const validatePartySize = (size: number): string | null => {
  if (size < 1 || size > 20) {
    return 'Party size must be between 1 and 20';
  }
  return null;
};

const validateDateTime = (date: Date, time: string): string | null => {
  const selectedDateTime = new Date(`${date.toDateString()} ${time}`);
  const now = new Date();
  
  if (selectedDateTime < now) {
    return 'Cannot make reservation in the past';
  }
  
  const hour = parseInt(time.split(':')[0]);
  if (hour < 10 || hour > 22) {
    return 'Reservations are only available between 10:00 and 22:00';
  }
  
  return null;
};
```

---

## 🎨 UI/UX Improvements (Bonus - if time permits)

### 1. Loading States
- Add skeleton loaders for lists
- Add shimmer effect during loading
- Better error messages

### 2. Toast Notifications
- Success messages
- Error handling
- Action confirmations

### 3. Responsive Design
- Mobile-friendly kitchen view
- Touch-optimized buttons
- Better table layouts

---

## 📊 Success Metrics

By end of session, achieve:
- ✅ Print functionality working
- ✅ Payment integration (test mode) working
- ✅ Form validation comprehensive
- ✅ Order status transitions validated
- ✅ All changes committed to GitHub

---

## 🔄 Testing Checklist

After implementation:
- [ ] Test print receipt feature
- [ ] Test payment flow (test card)
- [ ] Test form validations (all edge cases)
- [ ] Test order status transitions
- [ ] Test on mobile device
- [ ] Run automated tests
- [ ] Check for console errors

---

## 📝 Documentation to Update

- [ ] Update WEEK8_PROGRESS.md with completions
- [ ] Document print receipt usage
- [ ] Document payment integration setup
- [ ] Update API.md with new endpoints

---

**Start Time**: 11:45 PM
**Target Completion**: 2:30 AM (3 hours work)
**Priority**: Focus on Priority 1 & 2, then Priority 3 if time permits

Let's go! 🚀
